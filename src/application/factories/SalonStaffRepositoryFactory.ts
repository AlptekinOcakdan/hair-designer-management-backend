import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/SalonStaffModel";
import {salonStaffsTable} from "../../infrastructure/databases/drizzle/model";
import {ISalonStaffRepository} from "../../domain/repositories/ISalonStaffRepository";
import {DrizzleSalonStaffRepository} from "../../infrastructure/databases/drizzle/DrizzleSalonStaffRepository";

export class SalonStaffRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof salonStaffsTable
    ): ISalonStaffRepository {
        return new DrizzleSalonStaffRepository(db, table);
    }
}

