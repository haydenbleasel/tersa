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

    // File Storage
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    HUME_API_KEY: process.env.HUME_API_KEY,
    LMNT_API_KEY: process.env.LMNT_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
});
