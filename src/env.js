import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    SUPABASE_DATABASE_PASSWORD: z.string(),
    DB_USER: z.string(),
    PRISMA_PASSWORD: z.string(),
    PROJECT_REF: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string(),
    EVAL_API_BASE: z.string(),
    
    // Discord webhook URLs (optional)
    DISCORD_WEBHOOK_GENERAL: z.string().optional(),
    DISCORD_WEBHOOK_ADMIN: z.string().optional(),
    DISCORD_WEBHOOK_SECURITY: z.string().optional(),
    DISCORD_WEBHOOK_ERRORS: z.string().optional(),
    DISCORD_WEBHOOK_SCHOOL_ASSOCIATION: z.string().optional(),
    DISCORD_WEBHOOK_REGISTRATIONS: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_DISCORD_WEBHOOK_CONTACT: z.string().optional(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DATABASE_PASSWORD: process.env.SUPABASE_DATABASE_PASSWORD,
    DB_USER: process.env.DB_USER,
    PRISMA_PASSWORD: process.env.PRISMA_PASSWORD,
    PROJECT_REF: process.env.PROJECT_REF,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    EVAL_API_BASE: process.env.EVAL_API_BASE,
    // Discord webhook URLs
    DISCORD_WEBHOOK_GENERAL: process.env.DISCORD_WEBHOOK_GENERAL,
    DISCORD_WEBHOOK_ADMIN: process.env.DISCORD_WEBHOOK_ADMIN,
    DISCORD_WEBHOOK_SECURITY: process.env.DISCORD_WEBHOOK_SECURITY,
    DISCORD_WEBHOOK_ERRORS: process.env.DISCORD_WEBHOOK_ERRORS,
    DISCORD_WEBHOOK_SCHOOL_ASSOCIATION: process.env.DISCORD_WEBHOOK_SCHOOL_ASSOCIATION,
    DISCORD_WEBHOOK_REGISTRATIONS: process.env.DISCORD_WEBHOOK_REGISTRATIONS,
    NEXT_PUBLIC_DISCORD_WEBHOOK_CONTACT: process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_CONTACT,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
