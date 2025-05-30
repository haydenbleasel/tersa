import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [vercel()],
  server: {
    UPSTASH_REDIS_REST_URL: z.string().url().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    RESEND_TOKEN: z.string().min(1).startsWith('re_'),
    RESEND_EMAIL: z.string().email().min(1),

    STRIPE_SECRET_KEY: z.string().min(1).startsWith('sk_'),
    STRIPE_HOBBY_PRODUCT_ID: z.string().min(1).startsWith('prod_'),
    STRIPE_PRO_PRODUCT_ID: z.string().min(1).startsWith('prod_'),
    STRIPE_USAGE_PRODUCT_ID: z.string().min(1).startsWith('prod_'),
    STRIPE_CREDITS_METER_ID: z.string().min(1).startsWith('mtr_'),
    STRIPE_CREDITS_METER_NAME: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_'),

    SUPABASE_AUTH_HOOK_SECRET: z.string().min(1).startsWith('v1,whsec_'),

    // Supabase Integration
    POSTGRES_URL: z.string().url().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // AI SDK
    OPENAI_API_KEY: z.string().min(1).startsWith('sk-'),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    GROQ_API_KEY: z.string().min(1).startsWith('gsk_'),
    DEEPSEEK_API_KEY: z.string().min(1).startsWith('sk-'),
    ANTHROPIC_API_KEY: z.string().min(1).startsWith('sk-'),
    XAI_API_KEY: z.string().min(1).startsWith('xai-'),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_REGION: z.string().min(1),
    FAL_API_KEY: z.string().min(1),
    TOGETHER_AI_API_KEY: z.string().min(1).startsWith('tgp_v1_'),
    COHERE_API_KEY: z.string().min(1),
    VERCEL_API_KEY: z.string().min(1).startsWith('v1:'),
    MISTRAL_API_KEY: z.string().min(1),
    HUME_API_KEY: z.string().min(1),
    LMNT_API_KEY: z.string().min(1),

    // Other Models
    MINIMAX_GROUP_ID: z.string().min(1),
    MINIMAX_API_KEY: z.string().min(1),
    RUNWAYML_API_SECRET: z.string().min(1).startsWith('key_'),
    LUMAAI_API_KEY: z.string().min(1).startsWith('luma-'),
    BF_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().min(1),

    // Supabase Integration
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    FAL_API_KEY: process.env.FAL_API_KEY,
    TOGETHER_AI_API_KEY: process.env.TOGETHER_AI_API_KEY,
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    POSTGRES_URL: process.env.POSTGRES_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
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
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    VERCEL_API_KEY: process.env.VERCEL_API_KEY,
    HUME_API_KEY: process.env.HUME_API_KEY,
    LMNT_API_KEY: process.env.LMNT_API_KEY,
    BF_API_KEY: process.env.BF_API_KEY,
  },
});
