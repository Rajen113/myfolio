import { z } from "zod";
import { isReservedUsername } from "@/lib/constants/reserved-usernames";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Username can only contain lowercase letters, numbers, and hyphens"
  )
  .refine((val) => !val.startsWith("-"), {
    message: "Username cannot start with a hyphen",
  })
  .refine((val) => !val.endsWith("-"), {
    message: "Username cannot end with a hyphen",
  })
  .refine((val) => !isReservedUsername(val), {
    message: "This username is reserved by the system",
  });

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Full Name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address"),
    username: usernameSchema.optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      if (data.username && data.username.trim() !== "") {
        const result = usernameSchema.safeParse(data.username);
        return result.success;
      }
      return true;
    },
    {
      message: "Invalid username format",
      path: ["username"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUsernameSchema = z.object({
  username: usernameSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
