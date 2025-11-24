import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";


export const permissionsTable = pgTable('permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(), // örn: "create_appointment"
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});

export type PermissionDocument = InferSelectModel<typeof permissionsTable>;
export type PermissionInsert = InferInsertModel<typeof permissionsTable>;