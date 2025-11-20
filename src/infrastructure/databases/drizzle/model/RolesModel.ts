import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";


export const rolesTable = pgTable('roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    role: text('role').notNull(), // örn: "Admin", "Kuaför", "Müşteri"
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});