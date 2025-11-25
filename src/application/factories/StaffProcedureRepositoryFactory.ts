import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/StaffProcedureModel";
import {staffProceduresTable} from "../../infrastructure/databases/drizzle/model";
import {IStaffProcedureRepository} from "../../domain/repositories/IStaffProcedureRepository";
import {DrizzleStaffProcedureRepository} from "../../infrastructure/databases/drizzle/DrizzleStaffProcedureRepository";

export class StaffProcedureRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof staffProceduresTable
    ): IStaffProcedureRepository {
        return new DrizzleStaffProcedureRepository(db, table);
    }
}

