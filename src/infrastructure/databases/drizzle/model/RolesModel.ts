import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";


export const rolesTable = pgTable('roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    role: text('role').notNull().unique(), // örn: "Admin", "Kuaför", "Müşteri"
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});

export type RoleDocument = InferSelectModel<typeof rolesTable>;
export type RoleInsert = InferInsertModel<typeof rolesTable>;