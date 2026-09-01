import { z } from "zod";
import {
  DEGREE_OPTIONS,
  FIELD_OF_STUDY_OPTIONS,
} from "@/lib/constants/education-options";

const validDegreeValues = DEGREE_OPTIONS.map((opt) => opt.value) as [string, ...string[]];
const validFieldOfStudyValues = FIELD_OF_STUDY_OPTIONS.map((opt) => opt.value) as [string, ...string[]];

export const educationSchema = z
  .object({
    institution: z
      .string({ required_error: "Institution name is required." })
      .trim()
      .min(1, "Institution name is required.")
      .max(100, "Institution name cannot exceed 100 characters."),
    degree: z.enum(validDegreeValues, {
      required_error: "Degree / Qualification is required.",
      invalid_type_error: "Invalid degree selection.",
    }),
    customDegree: z
      .string()
      .trim()
      .max(100, "Custom degree cannot exceed 100 characters.")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
    fieldOfStudy: z
      .enum(validFieldOfStudyValues, {
        invalid_type_error: "Invalid field of study selection.",
      })
      .optional()
      .nullable(),
    customFieldOfStudy: z
      .string()
      .trim()
      .max(100, "Custom field of study cannot exceed 100 characters.")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
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
    grade: z
      .string()
      .trim()
      .max(50, "Grade / GPA cannot exceed 50 characters.")
      .optional()
      .nullable()
      .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
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
      if (data.degree === "OTHER" && (!data.customDegree || data.customDegree.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Please specify your degree / qualification when 'Other' is selected.",
      path: ["customDegree"],
    }
  )
  .refine(
    (data) => {
      if (
        data.fieldOfStudy === "OTHER" &&
        (!data.customFieldOfStudy || data.customFieldOfStudy.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please specify your field of study when 'Other' is selected.",
      path: ["customFieldOfStudy"],
    }
  )
  .refine(
    (data) => {
      // If current is true, endDate should not be set
      if (data.current && data.endDate !== null) {
        return false;
      }
      return true;
    },
    {
      message: "End date must not be set if currently studying here.",
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
      message: "End date is required unless this is your current education.",
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

export type EducationInput = z.infer<typeof educationSchema>;

export function formatEducationDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.getUTCFullYear().toString();
}
