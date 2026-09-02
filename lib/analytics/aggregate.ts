import { prisma } from "@/lib/prisma";
import { PortfolioAnalyticsData, AnalyticsTimeSeriesPoint, ReferrerCount, CountryCount, DeviceBreakdown } from "./types";

/**
 * Returns aggregated portfolio analytics for a specific user within a date range (7, 30, 90 days).
 * Performs all aggregations at the database level for optimal performance.
 */
export async function getPortfolioAnalytics(
  userId: string,
  days: number = 30
): Promise<PortfolioAnalyticsData> {
  const validDays = [7, 30, 90].includes(days) ? days : 30;
  const now = new Date();

  // Define date boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const rangeStartDate = new Date(now);
  rangeStartDate.setDate(rangeStartDate.getDate() - validDays + 1);
  rangeStartDate.setHours(0, 0, 0, 0);

  const date7DaysAgo = new Date(now);
  date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);

  const date30DaysAgo = new Date(now);
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

  // Parallel Database Aggregation Queries
  const [
    totalViewsCount,
    uniqueVisitorsResult,
    todayViewsCount,
    last7DaysViewsCount,
    last30DaysViewsCount,
    eventsInRange,
    referrerGroups,
    deviceGroups,
    countryGroups,
  ] = await Promise.all([
    // 1. Total Views
    prisma.portfolioViewEvent.count({
      where: { userId },
    }),

    // 2. Unique Visitors (All time distinct visitorHash)
    prisma.portfolioViewEvent.groupBy({
      by: ["visitorHash"],
      where: { userId, visitorHash: { not: null } },
    }),

    // 3. Views Today
    prisma.portfolioViewEvent.count({
      where: {
        userId,
        viewedAt: { gte: startOfToday },
      },
    }),

    // 4. Views in Last 7 Days
    prisma.portfolioViewEvent.count({
      where: {
        userId,
        viewedAt: { gte: date7DaysAgo },
      },
    }),

    // 5. Views in Last 30 Days
    prisma.portfolioViewEvent.count({
      where: {
        userId,
        viewedAt: { gte: date30DaysAgo },
      },
    }),

    // 6. Time Series Data (Events within selected range)
    prisma.portfolioViewEvent.findMany({
      where: {
        userId,
        viewedAt: { gte: rangeStartDate },
      },
      select: {
        viewedAt: true,
        visitorHash: true,
      },
    }),

    // 7. Top Referrers
    prisma.portfolioViewEvent.groupBy({
      by: ["referrerDomain"],
      where: {
        userId,
        viewedAt: { gte: rangeStartDate },
      },
      _count: {
        referrerDomain: true,
      },
      orderBy: {
        _count: {
          referrerDomain: "desc",
        },
      },
      take: 6,
    }),

    // 8. Device Breakdown
    prisma.portfolioViewEvent.groupBy({
      by: ["deviceType"],
      where: {
        userId,
        viewedAt: { gte: rangeStartDate },
      },
      _count: {
        deviceType: true,
      },
    }),

    // 9. Country Breakdown
    prisma.portfolioViewEvent.groupBy({
      by: ["countryCode"],
      where: {
        userId,
        countryCode: { not: null },
        viewedAt: { gte: rangeStartDate },
      },
      _count: {
        countryCode: true,
      },
      orderBy: {
        _count: {
          countryCode: "desc",
        },
      },
      take: 6,
    }),
  ]);

  // Construct daily time series buckets
  const timeSeriesMap = new Map<string, { views: number; visitors: Set<string> }>();

  for (let i = 0; i < validDays; i++) {
    const d = new Date(rangeStartDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    timeSeriesMap.set(dateStr, { views: 0, visitors: new Set() });
  }

  for (const event of eventsInRange) {
    const dateStr = event.viewedAt.toISOString().slice(0, 10);
    const bucket = timeSeriesMap.get(dateStr);
    if (bucket) {
      bucket.views += 1;
      if (event.visitorHash) {
        bucket.visitors.add(event.visitorHash);
      }
    }
  }

  const timeSeries: AnalyticsTimeSeriesPoint[] = Array.from(timeSeriesMap.entries()).map(
    ([date, bucket]) => ({
      date,
      views: bucket.views,
      uniqueVisitors: bucket.visitors.size,
    })
  );

  // Range total views for percentage calculations
  const rangeTotalViews = eventsInRange.length || 1;

  // Process Referrers
  const topReferrers: ReferrerCount[] = referrerGroups.map((g) => {
    const domain = g.referrerDomain || "Direct";
    const count = g._count.referrerDomain;
    const percentage = Math.round((count / rangeTotalViews) * 100);
    return { domain, count, percentage };
  });

  // Process Devices
  const deviceBreakdown: DeviceBreakdown = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    unknown: 0,
  };

  for (const d of deviceGroups) {
    const type = d.deviceType as keyof DeviceBreakdown;
    if (type && type in deviceBreakdown) {
      deviceBreakdown[type] = d._count.deviceType;
    } else {
      deviceBreakdown.unknown += d._count.deviceType;
    }
  }

  // Process Countries
  const countryBreakdown: CountryCount[] | null =
    countryGroups.length > 0
      ? countryGroups.map((c) => {
          const code = c.countryCode || "UNKNOWN";
          const count = c._count.countryCode;
          const percentage = Math.round((count / rangeTotalViews) * 100);
          return {
            country: code,
            code,
            count,
            percentage,
          };
        })
      : null;

  return {
    summary: {
      totalViews: totalViewsCount,
      uniqueVisitors: uniqueVisitorsResult.length,
      viewsToday: todayViewsCount,
      viewsLast7Days: last7DaysViewsCount,
      viewsLast30Days: last30DaysViewsCount,
    },
    timeSeries,
    topReferrers,
    deviceBreakdown,
    countryBreakdown,
    rangeDays: validDays,
  };
}
