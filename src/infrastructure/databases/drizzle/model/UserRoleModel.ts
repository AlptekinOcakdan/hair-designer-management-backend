import {pgTable, primaryKey, serial, timestamp, uuid} from "drizzle-orm/pg-core";
import { usersTable } from "./UserModel";
import { rolesTable } from "./RolesModel";
import { organisationsTable } from "./OrganisationModel";
import { salonsTable } from "./SalonModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const userRolesTable = pgTable('user_roles', {
    id: serial().primaryKey(),
    userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
    roleId: uuid('role_id').references(() => rolesTable.id, { onDelete: 'cascade' }).notNull(),
    organisationId: uuid('organisation_id').references(() => organisationsTable.id, { onDelete: 'cascade' }),
    salonId: uuid('salon_id').references(() => salonsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});

export type UserRoleDocument = InferSelectModel<typeof userRolesTable>;
export type UserRoleInsert = InferInsertModel<typeof userRolesTable>;