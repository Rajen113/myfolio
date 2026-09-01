import { z } from "zod";

export const SKILL_PROFICIENCY_VALUES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

export type SkillProficiencyType = (typeof SKILL_PROFICIENCY_VALUES)[number];

export const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Cloud",
  "Programming Languages",
  "Tools",
  "Soft Skills",
  "Other",
] as const;

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(50, "Skill name must not exceed 50 characters"),
  category: z
    .string()
    .trim()
    .max(50, "Category must not exceed 50 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  proficiency: z.enum(SKILL_PROFICIENCY_VALUES, {
    errorMap: () => ({ message: "Please select a valid proficiency level" }),
  }),
  displayOrder: z.number().int().min(0).max(10000).optional().default(0),
});

export type SkillInput = z.infer<typeof skillSchema>;
