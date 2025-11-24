import { IProcedureRepository } from '../../../domain/repositories/IProcedureRepository';
import { Procedure } from '../../../domain/entities/Procedure';
import { ProcedureDocument, ProcedureInsert, proceduresTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/ProcedureModel";
import { eq } from "drizzle-orm";

export class DrizzleProcedureRepository implements IProcedureRepository {
    private readonly table: typeof proceduresTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof proceduresTable
    ) {
        this.table = table;
    }

    private toPersistence(proc: Procedure): ProcedureInsert {
        return {
            id: proc.id ? proc.id : undefined,
            name: proc.name,
            createdAt: proc.createdAt ? proc.createdAt : undefined,
            updatedAt: proc.updatedAt ? proc.updatedAt : undefined,
        };
    }

    private toDomain(procDoc: ProcedureDocument): Procedure {
        return new Procedure(
            procDoc.id,
            procDoc.name,
            procDoc.createdAt,
            procDoc.updatedAt
        );
    }

    async create(procedure: Procedure): Promise<Procedure> {
        const persistence = this.toPersistence(procedure);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(id: string): Promise<Procedure | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<Procedure[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(procedure: Procedure): Promise<Procedure> {
        if (!procedure.id) {
            throw new Error("Procedure ID is required for update operation.");
        }

        const persistence = this.toPersistence(procedure);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(eq(this.table.id, procedure.id))
            .returning();

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}

