import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),

  SUPABASE_PROJECT_ID: z.string().optional(),

  ENCRYPTION_KEY: z
    .string()
    .min(1, "ENCRYPTION_KEY is required — see .env.example"),

  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REDIRECT_URI: z.string().url(),

  SOUNDCLOUD_CLIENT_ID: z.string().optional().default(""),
  SOUNDCLOUD_REDIRECT_URI: z.string().url().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

function parseServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `\n❌ Invalid environment variables:\n${issues}\n\nSee .env.example and copy to .env.local.\n`,
    );
  }
  return parsed.data;
}

function parseClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export const serverEnv: ServerEnv =
  typeof window === "undefined"
    ? parseServerEnv()
    : (undefined as unknown as ServerEnv);

export const clientEnv: ClientEnv = parseClientEnv();
