import {IUserRoleRepository} from "../../../domain/repositories/IUserRoleRepository";
import {UserRoleDocument, UserRoleInsert, userRolesTable} from "./model/UserRoleModel";
import {UserRole} from "../../../domain/entities/UserRole";
import * as schema from "./model/UserRoleModel";
import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";


export class DrizzleUserRoleRepository implements IUserRoleRepository {
    private readonly table: typeof userRolesTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof userRolesTable
    ) {
        this.table = table;
    }

    private toPersistence(ur: UserRole): UserRoleInsert {
        return {
            userId: ur.userId,
            roleId: ur.roleId,
            // explicit null döndür: driver null parametresi gönderir, placeholder sayısı ile uyumlu olur
            organisationId: ur.organisationId ?? null,
            salonId: ur.salonId ?? null,
            createdAt: ur.createdAt,
            updatedAt: ur.updatedAt ?? null,
        };
    }

    private toDomain(doc: UserRoleDocument): UserRole {
        return new UserRole(
            doc.id,
            doc.userId,
            doc.roleId,
            doc.organisationId ?? null,
            doc.salonId ?? null,
            doc.createdAt,
            doc.updatedAt ?? null
        );
    }

    async create(userRole: UserRole): Promise<UserRole> {
        const persistence = this.toPersistence(userRole);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();
        return this.toDomain(inserted);
    }

    async findAll(): Promise<UserRole[]> {
        const results = await this.db
            .select()
            .from(this.table);

        return results.map((doc) => this.toDomain(doc));
    }

    async findById(userId: string, roleId: string): Promise<UserRole | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.roleId, roleId)
                )
            );

        if (!found) return null;
        return this.toDomain(found);
    }

    async findByOrganisationId(organisationId: string): Promise<UserRole[]> {
        const results = await this.db
            .select()
            .from(this.table)
            .where(
                eq(this.table.organisationId, organisationId)
            );

        return results.map(doc => this.toDomain(doc));
    }

    async findByRoleId(roleId: string): Promise<UserRole[]> {
        const results = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.roleId, roleId));
        return results.map(doc => this.toDomain(doc));
    }

    async findBySalonId(salonId: string): Promise<UserRole[]> {
        const results = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.salonId, salonId));
        return results.map(doc => this.toDomain(doc));
    }

    async findByUserId(userId: string): Promise<UserRole[]> {
        const results = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.userId, userId));
        return results.map(doc => this.toDomain(doc));
    }

    async update(userRole: UserRole): Promise<UserRole> {
        const persistence = this.toPersistence(userRole);
        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(
                and(
                    eq(this.table.userId, userRole.userId),
                    eq(this.table.roleId, userRole.roleId),
                    userRole.organisationId ? eq(this.table.organisationId, userRole.organisationId) : undefined,
                    userRole.salonId ? eq(this.table.salonId, userRole.salonId) : undefined
                )
            )
            .returning();

        if (!updated) {
            throw new Error("UserRole not found for update.");
        }
        return this.toDomain(updated);
    }

    async delete(userId: string, roleId: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.roleId, roleId)
                )
            );
    }
}