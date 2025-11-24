import { pgTable, uuid, timestamp, boolean as pgBoolean, text } from "drizzle-orm/pg-core";
import {usersTable} from "./UserModel";
import {proceduresTable} from "./ProcedureModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const userStaffAppointmentsTable = pgTable('user_staff_appointments', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').references(() => usersTable.id).notNull(),
    staffId: uuid('staff_id').references(() => usersTable.id).notNull(),
    procedureIds: uuid('procedure_ids').array().notNull(),
    appointmentDate: timestamp('appointment_date').notNull(),
    isCompleted: pgBoolean('is_comleted').notNull().default(false),
    isCanceled: pgBoolean('is_canceled').notNull().default(false),
    cancellationReason: text('cancellation_reason'),
    cancelledBy: uuid('cancelled_by').references(() => usersTable.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
});

export type UserStaffAppointmentDocument = InferSelectModel<typeof userStaffAppointmentsTable>;
export type UserStaffAppointmentInsert = InferInsertModel<typeof userStaffAppointmentsTable>;