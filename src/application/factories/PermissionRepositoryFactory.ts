import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/PermissionModel";
import {permissionsTable} from "../../infrastructure/databases/drizzle/model";
import {IPermissionRepository} from "../../domain/repositories/IPermissionRepository";
import {DrizzlePermissionRepository} from "../../infrastructure/databases/drizzle/DrizzlePermissionRepository";

export class PermissionRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof permissionsTable
    ): IPermissionRepository {
        return new DrizzlePermissionRepository(db, table);
    }
}

