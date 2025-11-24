import { IUserPermissionRepository } from '../../../domain/repositories/IUserPermissionRepository';
import { UserPermission } from '../../../domain/entities/UserPermission';
import { UserPermissionDocument, UserPermissionInsert, userPermissionsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/UserPermissionModel";
import { eq, and } from "drizzle-orm";

export class DrizzleUserPermissionRepository implements IUserPermissionRepository {
    private readonly table: typeof userPermissionsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof userPermissionsTable
    ) {
        this.table = table;
    }

    private toPersistence(up: UserPermission): UserPermissionInsert {
        return {
            // composite key kullanıldığından 'id' yok
            userId: up.userId,
            permissionId: up.permissionId,
            createdAt: up.createdAt,
            updatedAt: up.updatedAt ? up.updatedAt : undefined,
        };
    }

    private toDomain(doc: UserPermissionDocument): UserPermission {
        return new UserPermission(
            doc.userId,
            doc.permissionId,
            doc.createdAt,
            doc.updatedAt ?? null
        );
    }

    async create(userPermission: UserPermission): Promise<UserPermission> {
        const persistence = this.toPersistence(userPermission);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(userId: string, permissionId: string): Promise<UserPermission | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.permissionId, permissionId)
                )
            );

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<UserPermission[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(userPermission: UserPermission): Promise<UserPermission> {
        const persistence = this.toPersistence(userPermission);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(
                and(
                    eq(this.table.userId, userPermission.userId),
                    eq(this.table.permissionId, userPermission.permissionId)
                )
            )
            .returning();

        if (!updated) {
            throw new Error("UserPermission not found for update.");
        }

        return this.toDomain(updated);
    }

    async delete(userId: string, permissionId: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.permissionId, permissionId)
                )
            );
    }
}

