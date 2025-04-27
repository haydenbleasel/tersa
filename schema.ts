import { sql } from 'drizzle-orm';
import { json, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

const uuid = sql`uuid_generate_v4()`;

export const projects = pgTable('project', {
  id: text('id').primaryKey().default(uuid).notNull(),
  name: varchar('name').notNull(),
  transcriptionModel: varchar('transcription_model').notNull(),
  visionModel: varchar('vision_model').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  content: json('content'),
  userId: varchar('user_id').notNull(),
  organizationId: varchar('organization_id'),
  image: varchar('image'),
});
