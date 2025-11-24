import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {organisationsTable} from "./OrganisationModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const salonsTable = pgTable('salons', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    organisationId: uuid('organisation_id')
        .references(() => organisationsTable.id)
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});

export type SalonDocument = InferSelectModel<typeof salonsTable>;
export type SalonInsert = InferInsertModel<typeof salonsTable>;