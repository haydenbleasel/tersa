import { vercel } from "@t3-oss/env-core/presets-zod";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [vercel()],
  server: {
    // AI SDK
    OPENAI_API_KEY: z.string().min(1).startsWith("sk-"),
    HUME_API_KEY: z.string().min(1),
    LMNT_API_KEY: z.string().min(1),

    // Other Models
    MINIMAX_GROUP_ID: z.string().min(1),
    MINIMAX_API_KEY: z.string().min(1),
    RUNWAYML_API_SECRET: z.string().min(1).startsWith("key_"),
    LUMA_API_KEY: z.string().min(1).startsWith("luma-"),

    // File Storage
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MINIMAX_GROUP_ID: process.env.MINIMAX_GROUP_ID,
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    RUNWAYML_API_SECRET: process.env.RUNWAYML_API_SECRET,
    LUMA_API_KEY: process.env.LUMA_API_KEY,
    HUME_API_KEY: process.env.HUME_API_KEY,
    LMNT_API_KEY: process.env.LMNT_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
});
