import { z } from "zod";

export const portfolioSettingsSchema = z.object({
  template: z
    .enum(["MODERN", "MINIMAL", "PROFESSIONAL"], {
      message: "Invalid portfolio template selected.",
    })
    .optional(),
  themeMode: z
    .enum(["LIGHT", "DARK", "SYSTEM"], {
      message: "Invalid theme mode.",
    })
    .optional(),
  themeColor: z
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Invalid hex color format (e.g. #2563EB).",
    })
    .refine(
      (val) => !/url\(|javascript:|expression\(/i.test(val),
      "Color value contains unsafe CSS parameters."
    )
    .optional(),
  fontFamily: z
    .enum(["INTER", "PLUS_JAKARTA_SANS", "DM_SANS", "MANROPE"], {
      message: "Invalid font family selected.",
    })
    .optional(),
  showAbout: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showEducation: z.boolean().optional(),
  showContact: z.boolean().optional(),
  showSocialLinks: z.boolean().optional(),
  buttonStyle: z
    .enum(["ROUNDED", "PILL", "SQUARE"], {
      message: "Invalid button style selected.",
    })
    .optional(),
  borderRadius: z
    .enum(["SMALL", "MEDIUM", "LARGE"], {
      message: "Invalid border radius selected.",
    })
    .optional(),
});

export type PortfolioSettingsInput = z.infer<typeof portfolioSettingsSchema>;
