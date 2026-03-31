import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  API_URL: z.string().url(),
  WEB_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_ENDPOINT: z.string().url(),
  R2_BUCKET: z.string(),
  GROQ_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
