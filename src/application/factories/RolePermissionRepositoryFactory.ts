import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/RolePermissionModel";
import {rolePermissionsTable} from "../../infrastructure/databases/drizzle/model";
import {IRolePermissionRepository} from "../../domain/repositories/IRolePermissionRepository";
import {DrizzleRolePermissionRepository} from "../../infrastructure/databases/drizzle/DrizzleRolePermissionRepository";

export class RolePermissionRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof rolePermissionsTable
    ): IRolePermissionRepository {
        return new DrizzleRolePermissionRepository(db, table);
    }
}

