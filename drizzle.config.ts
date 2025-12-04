import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema.ts",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
});
