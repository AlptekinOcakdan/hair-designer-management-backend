import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const organisationsTable = pgTable('organisations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});