import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { Role } from '../../../domain/entities/Role';
import { RoleDocument, RoleInsert, rolesTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/RolesModel";
import { eq } from "drizzle-orm";

export class DrizzleRoleRepository implements IRoleRepository {
    private readonly table: typeof rolesTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof rolesTable
    ) {
        this.table = table;
    }

    private toPersistence(role: Role): RoleInsert {
        return {
            id: role.id ? role.id : undefined,
            role: role.role,
            createdAt: role.createdAt ? role.createdAt : undefined,
            updatedAt: role.updatedAt ? role.updatedAt : undefined,
        };
    }

    private toDomain(roleDoc: RoleDocument): Role {
        return new Role(
            roleDoc.id,
            roleDoc.role,
            roleDoc.createdAt,
            roleDoc.updatedAt
        );
    }

    async create(role: Role): Promise<Role> {
        const persistence = this.toPersistence(role);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(id: string): Promise<Role | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<Role[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(role: Role): Promise<Role> {
        if (!role.id) {
            throw new Error("Role ID is required for update operation.");
        }

        const persistence = this.toPersistence(role);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(eq(this.table.id, role.id))
            .returning();

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}

