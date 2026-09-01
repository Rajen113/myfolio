import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .pipe(
    z
      .string()
      .url("Must be a valid URL (e.g. https://example.com)")
      .optional()
  );

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Project title is required")
    .max(100, "Project title must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must not exceed 2000 characters"),
  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  technologies: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Technology name cannot be empty")
        .max(30, "Technology name must not exceed 30 characters")
    )
    .max(15, "Cannot add more than 15 technologies")
    .default([]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(10000).optional().default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;
