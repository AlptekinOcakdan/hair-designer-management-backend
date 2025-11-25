import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model";
import {rolesTable} from "../../infrastructure/databases/drizzle/model";
import {IRoleRepository} from "../../domain/repositories/IRoleRepository";
import {DrizzleRoleRepository} from "../../infrastructure/databases/drizzle/DrizzleRoleRepository";

export class RoleRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof rolesTable
    ): IRoleRepository {
        return new DrizzleRoleRepository(db, table);
    }
}

