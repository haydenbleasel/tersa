import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [vercel()],
  server: {
    OPENAI_API_KEY: z.string().min(1),
    DATABASE_URL: z.string().url().min(1),

    MINIMAX_GROUP_ID: z.string().min(1),
    MINIMAX_API_KEY: z.string().min(1),

    UPSTASH_REDIS_REST_URL: z.string().url().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    RESEND_TOKEN: z.string().min(1),
    RESEND_EMAIL: z.string().email().min(1),

    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_HOBBY_PRODUCT_ID: z.string().min(1),
    STRIPE_PRO_PRODUCT_ID: z.string().min(1),
    STRIPE_USAGE_PRODUCT_ID: z.string().min(1),
    STRIPE_CREDITS_METER_ID: z.string().min(1),
    STRIPE_CREDITS_METER_NAME: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_AUTH_HOOK_SECRET: z.string().min(1),

    RUNWAYML_API_SECRET: z.string().min(1),

    LUMAAI_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
    NEXT_PUBLIC_WSS_SIGNALING_URL: z.string().url().min(1),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_WSS_SIGNALING_URL: process.env.NEXT_PUBLIC_WSS_SIGNALING_URL,
    MINIMAX_GROUP_ID: process.env.MINIMAX_GROUP_ID,
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RESEND_TOKEN: process.env.RESEND_TOKEN,
    RESEND_EMAIL: process.env.RESEND_EMAIL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_HOBBY_PRODUCT_ID: process.env.STRIPE_HOBBY_PRODUCT_ID,
    STRIPE_PRO_PRODUCT_ID: process.env.STRIPE_PRO_PRODUCT_ID,
    STRIPE_USAGE_PRODUCT_ID: process.env.STRIPE_USAGE_PRODUCT_ID,
    STRIPE_CREDITS_METER_ID: process.env.STRIPE_CREDITS_METER_ID,
    STRIPE_CREDITS_METER_NAME: process.env.STRIPE_CREDITS_METER_NAME,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_AUTH_HOOK_SECRET: process.env.SUPABASE_AUTH_HOOK_SECRET,
    RUNWAYML_API_SECRET: process.env.RUNWAYML_API_SECRET,
    LUMAAI_API_KEY: process.env.LUMAAI_API_KEY,
  },
});
