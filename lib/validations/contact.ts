import { z } from "zod";

export const contactSubmissionSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(254, "Email must be 254 characters or less"),
  subject: z
    .string()
    .trim()
    .max(200, "Subject must be 200 characters or less")
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be 5000 characters or less"),
  website: z.string().optional(), // Honeypot field
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
