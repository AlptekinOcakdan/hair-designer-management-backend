import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/UserStaffAppointmentModel";
import {userStaffAppointmentsTable} from "../../infrastructure/databases/drizzle/model";
import {IUserStaffAppointmentRepository} from "../../domain/repositories/IUserStaffAppointmentRepository";
import {DrizzleUserStaffAppointmentRepository} from "../../infrastructure/databases/drizzle/DrizzleUserStaffAppointmentRepository";

export class UserStaffAppointmentRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof userStaffAppointmentsTable
    ): IUserStaffAppointmentRepository {
        return new DrizzleUserStaffAppointmentRepository(db, table);
    }
}

