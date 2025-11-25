import * as schema from "../../infrastructure/databases/drizzle/model";
import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import {userRolesTable} from "../../infrastructure/databases/drizzle/model";
import {IUserRoleRepository} from "../../domain/repositories/IUserRoleRepository";
import {DrizzleUserRoleRepository} from "../../infrastructure/databases/drizzle/DrizzleUserRoleRepository";

export class UserRoleRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof userRolesTable
    ): IUserRoleRepository {
        return new DrizzleUserRoleRepository(db,table);
    }
}