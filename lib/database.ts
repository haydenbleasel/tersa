import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// biome-ignore lint/performance/noNamespaceImport: Required for drizzle-orm schema
import * as schema from "@/schema";
import { env } from "./env";

declare global {
  var postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

let client: ReturnType<typeof postgres> | undefined;

if (process.env.NODE_ENV !== "production") {
  if (!global.postgresSqlClient) {
    // Disable prefetch as it is not supported for "Transaction" pool mode
    global.postgresSqlClient = postgres(env.POSTGRES_URL, { prepare: false });
  }
  client = global.postgresSqlClient;
} else {
  // Disable prefetch as it is not supported for "Transaction" pool mode
  client = postgres(env.POSTGRES_URL, { prepare: false });
}

export const database = drizzle({ client, schema });
