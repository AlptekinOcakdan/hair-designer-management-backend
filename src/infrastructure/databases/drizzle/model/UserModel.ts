import {boolean, pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const usersTable = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    firstname: text('firstname').notNull(),
    lastname: text('lastname').notNull(),
    email: text('email').notNull().unique(),
    phoneNumber: text('phone_number').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    phoneVerified: boolean('phone_verified').default(false).notNull(),
    refreshToken: text('refresh_token').notNull(),
    TOSAccepted: boolean('tos_accepted').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});

export type UserDocument = InferSelectModel<typeof usersTable>;
export type UserInsert = InferInsertModel<typeof usersTable>;