import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const proceduresTable = pgTable('procedures', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(), // örn: "Saç Kesimi", "Boya"
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});