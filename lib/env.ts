import { z } from "zod";
import fs from "fs";
import path from "path";

function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...valParts] = trimmed.split("=");
          const val = valParts.join("=").replace(/^["']|["']$/g, "").trim();
          const cleanKey = key.trim();
          if (cleanKey && (!process.env[cleanKey] || process.env[cleanKey] === "")) {
            process.env[cleanKey] = val;
          }
        }
      }
    }
  } catch {
    // Ignore reading errors
  }

  // Always supply fallback values if missing or empty
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === "") {
    process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/myfolio?schema=public";
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === "") {
    process.env.AUTH_SECRET = "super-secret-random-key-myfolio-2026";
  }
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL environment variable is required."),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET environment variable is required."),
  NEXTAUTH_URL: z.string().optional(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().default("myfolio.com"),
  MYFOLIO_ROOT_DOMAIN: z.string().default("myfolio.com"),
  MYFOLIO_DOMAIN_TARGET: z.string().default("cname.myfolio.com"),
  MYFOLIO_CUSTOM_DOMAIN_ENABLED: z.string().default("true"),
  NEXT_PUBLIC_SITE_PROTOCOL: z.string().default("https:"),
  NEXT_PUBLIC_APP_PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export function validateEnv() {
  loadEnvFile();
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation error:");
    const errors = result.error.flatten().fieldErrors;
    for (const [field, messages] of Object.entries(errors)) {
      console.error(`  - ${field}: ${messages?.join(", ")}`);
    }

    if (process.env.STRICT_ENV_CHECK === "true") {
      throw new Error("Fatal: Missing or invalid production environment variables.");
    }
  }

  return result.success ? result.data : null;
}
