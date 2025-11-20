// src/infrastructure/databases/drizzle/schema/UserSchema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Tablo Tanımı (Mongoose Schema yerine)
export const usersTable = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(), // _id yerine
    username: text('username').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    refreshToken: text('refresh_token'), // camelCase yerine veritabanında snake_case önerilir ama tercih senin
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// UserDocument arayüzünü korumak için Drizzle'ın "Infer" özelliğini kullanıyoruz.
// Bu sayede interface'i elle yazmana gerek kalmaz, şemadan otomatik üretilir.
export type UserDocument = InferSelectModel<typeof usersTable>; // Veritabanından gelen okuma tipi
export type UserInsert = InferInsertModel<typeof usersTable>;   // Veritabanına yazma tipi