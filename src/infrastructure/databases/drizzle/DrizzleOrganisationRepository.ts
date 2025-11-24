import { IOrganisationRepository } from '../../../domain/repositories/IOrganisationRepository';
import { Organisation } from '../../../domain/entities/Organisation';
import { OrganisationDocument, OrganisationInsert, organisationsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/OrganisationModel";
import { eq } from "drizzle-orm";

export class DrizzleOrganisationRepository implements IOrganisationRepository {
    private readonly table: typeof organisationsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof organisationsTable
    ) {
        this.table = table;
    }

    private toPersistence(org: Organisation): OrganisationInsert {
        return {
            id: org.id ? org.id : undefined,
            name: org.name,
            userId: org.userId,
            createdAt: org.createdAt ? org.createdAt : undefined,
            updatedAt: org.updatedAt ? org.updatedAt : undefined,
        };
    }

    private toDomain(orgDoc: OrganisationDocument): Organisation {
        return new Organisation(
            orgDoc.id,
            orgDoc.name,
            orgDoc.userId,
            orgDoc.createdAt,
            orgDoc.updatedAt
        );
    }

    async create(organisation: Organisation): Promise<Organisation> {
        const persistence = this.toPersistence(organisation);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(id: string): Promise<Organisation | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!found) return null;
        return this.toDomain(found);
    }

    // Tüm organisation'ları getir
    // NOT: DrizzleUserRepository ile paralel olmak adına burada ham doküman dizisi dönme tercihi yapılabilir.
    async findAll(): Promise<Organisation[]> {
        return this.db.select().from(this.table);
    }

    // Kullanıcıya ait organisation'ları getir (my organisations)
    async findByUserId(userId: string): Promise<Organisation[]> {
        const rows = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.userId, userId));

        return rows.map(r => this.toDomain(r));
    }

    async update(organisation: Organisation): Promise<Organisation> {
        if (!organisation.id) {
            throw new Error("Organisation ID is required for update operation.");
        }

        const persistence = this.toPersistence(organisation);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(eq(this.table.id, organisation.id))
            .returning();

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}

