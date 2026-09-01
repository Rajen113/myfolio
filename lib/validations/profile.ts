import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .pipe(
    z
      .string()
      .url("Must be a valid URL (including https://)")
      .optional()
  );

const optionalEmail = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .pipe(z.string().email("Must be a valid email address").optional());

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full Name must be at least 2 characters")
    .max(100, "Full Name must not exceed 100 characters"),
  headline: z
    .string()
    .trim()
    .max(120, "Headline must not exceed 120 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .max(100, "Location must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  website: optionalUrl,
  github: optionalUrl,
  linkedin: optionalUrl,
  email: optionalEmail,
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must not exceed 30 characters")
    .optional()
    .or(z.literal("")),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;
