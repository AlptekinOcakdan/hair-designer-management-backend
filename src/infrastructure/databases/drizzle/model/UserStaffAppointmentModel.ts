import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import {usersTable} from "./UserModel";
import {proceduresTable} from "./ProcedureModel";

export const userStaffAppointmentsTable = pgTable('user_staff_appointments', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').references(() => usersTable.id).notNull(),
    staffId: uuid('staff_id').references(() => usersTable.id).notNull(),
    procedureId: uuid('procedure_id').references(() => proceduresTable.id).notNull(),
    appointmentDate: timestamp('appointment_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});