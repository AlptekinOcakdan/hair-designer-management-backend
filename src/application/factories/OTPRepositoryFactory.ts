import {DrizzleOTPRepository} from "../../infrastructure/databases/drizzle/DrizzleOTPRepository";
import {IOTPRepository} from "../../domain/repositories/IOTPRepository";
import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model";
import {otpsTable} from "../../infrastructure/databases/drizzle/model";

export class OTPRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof otpsTable,
    ): IOTPRepository {
        return new DrizzleOTPRepository(db, table);
    }
}