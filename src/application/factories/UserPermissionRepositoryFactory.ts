import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/UserPermissionModel";
import {userPermissionsTable} from "../../infrastructure/databases/drizzle/model";
import {IUserPermissionRepository} from "../../domain/repositories/IUserPermissionRepository";
import {DrizzleUserPermissionRepository} from "../../infrastructure/databases/drizzle/DrizzleUserPermissionRepository";

export class UserPermissionRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof userPermissionsTable
    ): IUserPermissionRepository {
        return new DrizzleUserPermissionRepository(db, table);
    }
}

