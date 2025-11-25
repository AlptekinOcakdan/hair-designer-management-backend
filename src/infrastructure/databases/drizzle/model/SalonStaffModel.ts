import {pgTable, uuid, timestamp, primaryKey, text, boolean} from "drizzle-orm/pg-core";
import {salonsTable} from "./SalonModel";
import {usersTable} from "./UserModel";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

export const salonStaffsTable = pgTable('salon_staffs', {
    salonId: uuid('salon_id').references(() => salonsTable.id).notNull(),
    userId: uuid('user_id').references(() => usersTable.id).notNull(),
    avalaibleForAppointments: boolean('avalaible_for_appointments').default(false).notNull(),
    availableWeekDays: text('available_week_days').array().notNull().default([]),
    availableDays: text('available_days').array().notNull().default([]),
    availability: boolean('availability').default(false).notNull(),
    availableHours: text('available_hours').array().notNull().default([]),
    nonAvailableRange: text('non_available_range').array().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.salonId, table.userId] }),
    };
});

export type SalonStaffDocument = InferSelectModel<typeof salonStaffsTable>;
export type SalonStaffInsert = InferInsertModel<typeof salonStaffsTable>;