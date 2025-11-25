import { IRolePermissionRepository } from '../../../domain/repositories/IRolePermissionRepository';
import { RolePermission } from '../../../domain/entities/RolePermission';
import { RolePermissionDocument, RolePermissionInsert, rolePermissionsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/RolePermissionModel";
import { eq, and } from "drizzle-orm"; // 'and' operatörünü ekledik

export class DrizzleRolePermissionRepository implements IRolePermissionRepository {
    private readonly table: typeof rolePermissionsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof rolePermissionsTable
    ) {
        this.table = table;
    }

    private toPersistence(rp: RolePermission): RolePermissionInsert {
        return {
            // 'id' alanı kaldırıldı çünkü veritabanında böyle bir kolon yok.
            roleId: rp.roleId,
            permissionId: rp.permissionId,
            createdAt: rp.createdAt,
            updatedAt: rp.updatedAt ? rp.updatedAt : undefined,
        };
    }

    private toDomain(rpDoc: RolePermissionDocument): RolePermission {
        return new RolePermission(
            rpDoc.roleId,
            rpDoc.permissionId,
            rpDoc.createdAt,
            rpDoc.updatedAt
        );
    }

    async create(rolePermission: RolePermission): Promise<RolePermission> {
        const persistence = this.toPersistence(rolePermission);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    // findById artık tek bir string değil, composite key'i oluşturan iki parçayı almalı
    async findById(roleId: string, permissionId: string): Promise<RolePermission | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.roleId, roleId),
                    eq(this.table.permissionId, permissionId)
                )
            );

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<RolePermission[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async findByRoleId(roleId: string): Promise<RolePermission[]> {
        const results = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.roleId, roleId));
        return results.map(doc => this.toDomain(doc));
    }

    async update(rolePermission: RolePermission): Promise<RolePermission> {
        // Update işlemi için Composite Key'e ihtiyacımız var.
        // Bu tabloda genelde sadece 'updatedAt' gibi alanlar güncellenir.
        // Eğer roleId veya permissionId değişecekse, bu teknik olarak yeni bir kayıttır (delete + create).

        const persistence = this.toPersistence(rolePermission);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(
                and(
                    eq(this.table.roleId, rolePermission.roleId),
                    eq(this.table.permissionId, rolePermission.permissionId)
                )
            )
            .returning();

        if (!updated) {
            throw new Error("RolePermission not found for update.");
        }

        return this.toDomain(updated);
    }

    // Delete işlemi de artık composite key istiyor
    async delete(roleId: string, permissionId: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(
                and(
                    eq(this.table.roleId, roleId),
                    eq(this.table.permissionId, permissionId)
                )
            );
    }
}