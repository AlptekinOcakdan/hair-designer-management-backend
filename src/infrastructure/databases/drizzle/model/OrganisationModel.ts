import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {usersTable} from "./UserModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const organisationsTable = pgTable('organisations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    userId: uuid('user_id').references(() => usersTable.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});

export type OrganisationDocument = InferSelectModel<typeof organisationsTable>;
export type OrganisationInsert = InferInsertModel<typeof organisationsTable>;