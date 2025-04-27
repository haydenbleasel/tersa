import { sql } from 'drizzle-orm';
import { json, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

const uuid = sql`uuid_generate_v4()`;

export const projects = pgTable('project', {
  id: text('id').primaryKey().default(uuid).notNull(),
  name: varchar().notNull(),
  transcriptionModel: varchar().notNull(),
  visionModel: varchar().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp(),
  content: json(),
  userId: varchar().notNull(),
  organizationId: varchar(),
  image: varchar(),
});
