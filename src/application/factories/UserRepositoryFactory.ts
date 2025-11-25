import {IUserRepository} from '../../domain/repositories/IUserRepository';
import {DrizzleUserRepository} from "../../infrastructure/databases/drizzle/DrizzleUserRepository";
import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model";
import {usersTable} from "../../infrastructure/databases/drizzle/model";

export class UserRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof usersTable,
    ): IUserRepository {
        return new DrizzleUserRepository(db, table);
    }
}
