import {pgTable, uuid, timestamp, integer, decimal, primaryKey} from "drizzle-orm/pg-core";
import {usersTable} from "./UserModel";
import { proceduresTable } from "./ProcedureModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";


export const staffProceduresTable = pgTable('staff_procedures', {
    userId: uuid('user_id').references(() => usersTable.id).notNull(), // Staff
    procedureId: uuid('procedure_id').references(() => proceduresTable.id).notNull(),
    duration: integer('duration').notNull(), // Dakika
    price: decimal('price', {precision: 10, scale: 2}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
}, (table) => {
    return {
        pk: primaryKey({columns: [table.userId, table.procedureId]}),
    };
});

export type StaffProcedureDocument = InferSelectModel<typeof staffProceduresTable>;
export type StaffProcedureInsert = InferInsertModel<typeof staffProceduresTable>;