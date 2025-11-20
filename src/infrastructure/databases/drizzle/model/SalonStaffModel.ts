import {pgTable, uuid, timestamp, primaryKey} from "drizzle-orm/pg-core";
import {salonsTable} from "./SalonModel";
import {usersTable} from "./UserModel";
import {rolesTable} from "./RolesModel";

export const salonStaffsTable = pgTable('salon_staffs', {
    salonId: uuid('salon_id').references(() => salonsTable.id).notNull(),
    userId: uuid('user_id').references(() => usersTable.id).notNull(),
    roleId: uuid('role_id').references(() => rolesTable.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
}, (table) => {
    return {
        // Composite Primary Key: Bir kullanıcı bir salonda sadece bir kez tanımlanabilir (rolü değişebilir ama satır tektir)
        pk: primaryKey({ columns: [table.salonId, table.userId] }),
    };
});