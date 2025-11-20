import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import {organisationsTable} from "./OrganisationModel";

export const salonsTable = pgTable('salons', {
    id: uuid('id').defaultRandom().primaryKey(),
    location: text('location').notNull(),
    organisationId: uuid('organisation_id')
        .references(() => organisationsTable.id)
        .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});