import { IUserStaffAppointmentRepository } from '../../../domain/repositories/IUserStaffAppointmentRepository';
import { UserStaffAppointment } from '../../../domain/entities/UserStaffAppointment';
import { UserStaffAppointmentDocument, UserStaffAppointmentInsert, userStaffAppointmentsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/UserStaffAppointmentModel";
import { eq } from "drizzle-orm";

export class DrizzleUserStaffAppointmentRepository implements IUserStaffAppointmentRepository {
    private readonly table: typeof userStaffAppointmentsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof userStaffAppointmentsTable
    ) {
        this.table = table;
    }

    private toPersistence(app: UserStaffAppointment): UserStaffAppointmentInsert {
        return {
            id: app.id ? app.id : undefined,
            clientId: app.clientId,
            staffId: app.staffId,
            procedureIds: app.procedureIds,
            appointmentDate: app.appointmentDate,
            isCompleted: app.isCompleted,
            isCanceled: app.isCanceled,
            cancellationReason: app.cancellationReason ?? undefined,
            cancelledBy: app.cancelledBy ?? undefined,
            createdAt: app.createdAt ? app.createdAt : undefined,
            updatedAt: app.updatedAt ? app.updatedAt : undefined,
        };
    }

    private toDomain(doc: UserStaffAppointmentDocument): UserStaffAppointment {
        return new UserStaffAppointment(
            doc.id,
            doc.clientId,
            doc.staffId,
            doc.procedureIds,
            doc.appointmentDate,
            doc.isCompleted,
            doc.isCanceled,
            doc.cancellationReason ?? null,
            doc.cancelledBy ?? null,
            doc.createdAt,
            doc.updatedAt ?? null
        );
    }

    async create(appointment: UserStaffAppointment): Promise<UserStaffAppointment> {
        const persistence = this.toPersistence(appointment);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    async findById(id: string): Promise<UserStaffAppointment | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<UserStaffAppointment[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(appointment: UserStaffAppointment): Promise<UserStaffAppointment> {
        if (!appointment.id) {
            throw new Error("Appointment ID is required for update operation.");
        }

        const persistence = this.toPersistence(appointment);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(eq(this.table.id, appointment.id))
            .returning();

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}

