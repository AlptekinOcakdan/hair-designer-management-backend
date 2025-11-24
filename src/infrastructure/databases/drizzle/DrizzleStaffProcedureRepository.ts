import { IStaffProcedureRepository } from '../../../domain/repositories/IStaffProcedureRepository';
import { StaffProcedure } from '../../../domain/entities/StaffProcedure';
import { StaffProcedureDocument, StaffProcedureInsert, staffProceduresTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/StaffProcedureModel";
import { eq, and } from "drizzle-orm";

export class DrizzleStaffProcedureRepository implements IStaffProcedureRepository {
    private readonly table: typeof staffProceduresTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof staffProceduresTable
    ) {
        this.table = table;
    }

    private toPersistence(sp: StaffProcedure): StaffProcedureInsert {
        return {
            userId: sp.userId,
            procedureId: sp.procedureId,
            duration: sp.duration,
            price: sp.price,
            createdAt: sp.createdAt,
            updatedAt: sp.updatedAt ? sp.updatedAt : undefined,
        };
    }

    private toDomain(doc: StaffProcedureDocument): StaffProcedure {
        return new StaffProcedure(
            doc.userId,
            doc.procedureId,
            doc.duration,
            doc.price,
            doc.createdAt,
            doc.updatedAt ?? null
        );
    }

    async create(staffProcedure: StaffProcedure): Promise<StaffProcedure> {
        const persistence = this.toPersistence(staffProcedure);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(userId: string, procedureId: string): Promise<StaffProcedure | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.procedureId, procedureId)
                )
            );

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<StaffProcedure[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(staffProcedure: StaffProcedure): Promise<StaffProcedure> {
        const persistence = this.toPersistence(staffProcedure);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(
                and(
                    eq(this.table.userId, staffProcedure.userId),
                    eq(this.table.procedureId, staffProcedure.procedureId)
                )
            )
            .returning();

        if (!updated) throw new Error("StaffProcedure not found for update.");

        return this.toDomain(updated);
    }

    async delete(userId: string, procedureId: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.procedureId, procedureId)
                )
            );
    }
}

