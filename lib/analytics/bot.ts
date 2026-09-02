const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandex/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterest/i,
  /slackbot/i,
  /discordbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /lighthouse/i,
  /gtmetrix/i,
  /pingdom/i,
  /uptimerobot/i,
  /headlesschrome/i,
  /phantomjs/i,
];

/**
 * Returns true if the user agent matches known crawlers, bots, spiders, or preview tools.
 */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
