import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/SalonModel";
import {salonsTable} from "../../infrastructure/databases/drizzle/model";
import {ISalonRepository} from "../../domain/repositories/ISalonRepository";
import {DrizzleSalonRepository} from "../../infrastructure/databases/drizzle/DrizzleSalonRepository";

export class SalonRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof salonsTable
    ): ISalonRepository {
        return new DrizzleSalonRepository(db, table);
    }
}

