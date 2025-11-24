import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./UserModel";
import {permissionsTable} from "./PermissionModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const userPermissionsTable = pgTable('user_permissions', {
    userId: uuid('user_id').references(() => usersTable.id).notNull(),
    permissionId: uuid('permission_id').references(() => permissionsTable.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.permissionId] }),
    };
});

export type UserPermissionDocument = InferSelectModel<typeof userPermissionsTable>;
export type UserPermissionInsert = InferInsertModel<typeof userPermissionsTable>;