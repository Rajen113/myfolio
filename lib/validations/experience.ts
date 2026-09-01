import { z } from "zod";

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
  "SELF_EMPLOYED",
  "OTHER",
] as const;

export type EmploymentTypeEnum = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentTypeEnum, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
  SELF_EMPLOYED: "Self-employed",
  OTHER: "Other",
};

export const experienceSchema = z
  .object({
    company: z
      .string({ required_error: "Company name is required." })
      .trim()
      .min(1, "Company name is required.")
      .max(100, "Company name cannot exceed 100 characters."),
    position: z
      .string({ required_error: "Job title / position is required." })
      .trim()
      .min(1, "Job title is required.")
      .max(100, "Job title cannot exceed 100 characters."),
    employmentType: z.enum(EMPLOYMENT_TYPES, {
      required_error: "Employment type is required.",
      invalid_type_error: "Invalid employment type.",
    }),
    location: z
      .string()
      .trim()
      .max(100, "Location cannot exceed 100 characters.")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    startDate: z
      .string({ required_error: "Start date is required." })
      .min(1, "Start date is required.")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date format.",
      }),
    endDate: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid end date format.",
      })
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    current: z.boolean().default(false),
    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters.")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    displayOrder: z.number().int().default(0),
  })
  .refine(
    (data) => {
      // If current is true, endDate should not be provided/must be null
      if (data.current && data.endDate !== null) {
        return false;
      }
      return true;
    },
    {
      message: "End date must not be set if currently working here.",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If current is false, endDate is required
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current job.",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // endDate cannot be before startDate
      if (!data.current && data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end < start) {
          return false;
        }
      }
      return true;
    },
    {
      message: "End date cannot be before start date.",
      path: ["endDate"],
    }
  );

export type ExperienceInput = z.infer<typeof experienceSchema>;

export function formatExperienceDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
