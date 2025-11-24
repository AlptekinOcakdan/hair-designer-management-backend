import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import {rolesTable} from "./RolesModel";
import {permissionsTable} from "./PermissionModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const rolePermissionsTable = pgTable('role_permissions', {
    roleId: uuid('role_id').references(() => rolesTable.id).notNull(),
    permissionId: uuid('permission_id').references(() => permissionsTable.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
    };
});

export type RolePermissionDocument = InferSelectModel<typeof rolePermissionsTable>;
export type RolePermissionInsert = InferInsertModel<typeof rolePermissionsTable>;