-- CreateTable
CREATE TABLE "PortfolioViewEvent" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrerDomain" TEXT,
    "deviceType" TEXT,
    "countryCode" TEXT,
    "visitorHash" TEXT,

    CONSTRAINT "PortfolioViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioViewEvent_portfolioId_viewedAt_idx" ON "PortfolioViewEvent"("portfolioId", "viewedAt");

-- CreateIndex
CREATE INDEX "PortfolioViewEvent_userId_viewedAt_idx" ON "PortfolioViewEvent"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "PortfolioViewEvent_userId_visitorHash_viewedAt_idx" ON "PortfolioViewEvent"("userId", "visitorHash", "viewedAt");

-- CreateIndex
CREATE INDEX "PortfolioViewEvent_portfolioId_visitorHash_idx" ON "PortfolioViewEvent"("portfolioId", "visitorHash");

-- AddForeignKey
ALTER TABLE "PortfolioViewEvent" ADD CONSTRAINT "PortfolioViewEvent_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "PortfolioSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioViewEvent" ADD CONSTRAINT "PortfolioViewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
