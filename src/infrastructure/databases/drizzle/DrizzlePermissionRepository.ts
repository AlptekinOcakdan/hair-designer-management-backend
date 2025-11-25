import { IPermissionRepository } from '../../../domain/repositories/IPermissionRepository';
import { Permission } from '../../../domain/entities/Permission';
import { PermissionDocument, PermissionInsert, permissionsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/PermissionModel";
import { eq } from "drizzle-orm";

export class DrizzlePermissionRepository implements IPermissionRepository {
    private readonly table: typeof permissionsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof permissionsTable
    ) {
        this.table = table;
    }

    private toPersistence(permission: Permission): PermissionInsert {
        return {
            id: permission.id ? permission.id : undefined,
            action: permission.action,
            description: permission.description,
            createdAt: permission.createdAt ? permission.createdAt : undefined,
            updatedAt: permission.updatedAt ? permission.updatedAt : undefined,
        };
    }

    private toDomain(permDoc: PermissionDocument): Permission {
        return new Permission(
            permDoc.id,
            permDoc.action,
            permDoc.description,
            permDoc.createdAt,
            permDoc.updatedAt
        );
    }

    async create(permission: Permission): Promise<Permission> {
        const persistence = this.toPersistence(permission);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(id: string): Promise<Permission | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<Permission[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(permission: Permission): Promise<Permission> {
        if (!permission.id) {
            throw new Error("Permission ID is required for update operation.");
        }

        const persistence = this.toPersistence(permission);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(eq(this.table.id, permission.id))
            .returning();

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}
