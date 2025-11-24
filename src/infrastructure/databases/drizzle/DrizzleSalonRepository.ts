import { ISalonRepository } from '../../../domain/repositories/ISalonRepository';
import { Salon } from '../../../domain/entities/Salon';
import { SalonDocument, SalonInsert, salonsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/SalonModel";
import { eq } from "drizzle-orm";

export class DrizzleSalonRepository implements ISalonRepository {
    private readonly table: typeof salonsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof salonsTable
    ) {
        this.table = table;
    }

    private toPersistence(salon: Salon): SalonInsert {
        return {
            id: salon.id ? salon.id : undefined,
            name: salon.name,
            location: salon.location,
            organisationId: salon.organisationId,
            createdAt: salon.createdAt ? salon.createdAt : undefined,
            updatedAt: salon.updatedAt ? salon.updatedAt : undefined,
        };
    }

    private toDomain(salonDoc: SalonDocument): Salon {
        return new Salon(
            salonDoc.id,
            salonDoc.name,
            salonDoc.location,
            salonDoc.organisationId,
            salonDoc.createdAt,
            salonDoc.updatedAt
        );
    }

    async create(salon: Salon): Promise<Salon> {
        const persistence = this.toPersistence(salon);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(id: string): Promise<Salon | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<Salon[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async findByOrganisationId(organisationId: string): Promise<Salon[]> {
        const rows = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.organisationId, organisationId));

        return rows.map(r => this.toDomain(r));
    }

    async update(salon: Salon): Promise<Salon> {
        if (!salon.id) {
            throw new Error("Salon ID is required for update operation.");
        }

        const persistence = this.toPersistence(salon);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(eq(this.table.id, salon.id))
            .returning();

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}

