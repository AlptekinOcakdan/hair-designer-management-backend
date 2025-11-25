import { UserStaffAppointment } from '../../domain/entities/UserStaffAppointment';

export class UserStaffAppointmentBuilder {
    private id: string = '';
    private clientId: string = '';
    private staffId: string = '';
    private procedureIds: string[] = [];
    private appointmentDate: Date = new Date();
    private isComleted: boolean = false;
    private isCanceled: boolean = false;
    private cancellationReason: string | null = null;
    private cancelledBy: string | null = null;
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setId(id: string): this {
        this.id = id;
        return this;
    }

    public setClientId(clientId: string): this {
        this.clientId = clientId;
        return this;
    }

    public setStaffId(staffId: string): this {
        this.staffId = staffId;
        return this;
    }

    public setProcedureId(procedureIds: string[]): this {
        this.procedureIds = procedureIds;
        return this;
    }

    public setAppointmentDate(appointmentDate: Date): this {
        this.appointmentDate = appointmentDate;
        return this;
    }

    public setIsComleted(isComleted: boolean): this {
        this.isComleted = isComleted;
        return this;
    }

    public setIsCanceled(isCanceled: boolean): this {
        this.isCanceled = isCanceled;
        return this;
    }

    public setCancellationReason(reason: string | null): this {
        this.cancellationReason = reason;
        return this;
    }

    public setCancelledBy(userId: string | null): this {
        this.cancelledBy = userId;
        return this;
    }

    public setCreatedAt(createdAt: Date): this {
        this.createdAt = createdAt;
        return this;
    }

    public setUpdatedAt(updatedAt: Date | null): this {
        this.updatedAt = updatedAt;
        return this;
    }

    public build(): UserStaffAppointment {
        return new UserStaffAppointment(
            this.id,
            this.clientId,
            this.staffId,
            this.procedureIds,
            this.appointmentDate,
            this.isComleted,
            this.isCanceled,
            this.cancellationReason,
            this.cancelledBy,
            this.createdAt,
            this.updatedAt
        );
    }
}

