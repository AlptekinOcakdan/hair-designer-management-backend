import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";


export const permissionsTable = pgTable('permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(), // örn: "create_appointment"
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});