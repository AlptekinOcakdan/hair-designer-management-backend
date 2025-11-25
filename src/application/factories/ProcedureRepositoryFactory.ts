import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/ProcedureModel";
import {proceduresTable} from "../../infrastructure/databases/drizzle/model";
import {IProcedureRepository} from "../../domain/repositories/IProcedureRepository";
import {DrizzleProcedureRepository} from "../../infrastructure/databases/drizzle/DrizzleProcedureRepository";

export class ProcedureRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof proceduresTable
    ): IProcedureRepository {
        return new DrizzleProcedureRepository(db, table);
    }
}

