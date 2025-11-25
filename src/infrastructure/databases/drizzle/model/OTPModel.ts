import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { usersTable } from './UserModel';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const otpsTable = pgTable('otps', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isValidated: boolean('is_validated').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export type OTPDocument = InferSelectModel<typeof otpsTable>;
export type OTPInsert = InferInsertModel<typeof otpsTable>;
