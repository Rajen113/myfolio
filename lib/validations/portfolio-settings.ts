import { z } from "zod";

export const portfolioSettingsSchema = z.object({
  template: z.enum(["MODERN", "MINIMAL", "PROFESSIONAL"], {
    message: "Invalid portfolio template selected. Options are MODERN, MINIMAL, or PROFESSIONAL.",
  }),
});

export type PortfolioSettingsInput = z.infer<typeof portfolioSettingsSchema>;
