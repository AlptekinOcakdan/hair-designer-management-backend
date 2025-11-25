import { SalonStaff } from '../../domain/entities/SalonStaff';

export class SalonStaffBuilder {
    private salonId: string = '';
    private userId: string = '';
    private roleId: string = '';
    private avalaibleForAppointments: boolean = false;
    private availableWeekDays: string[] = [];
    private availableHours: string[] = [];
    private nonAvailableRange: string[] = [];
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setSalonId(salonId: string): this {
        this.salonId = salonId;
        return this;
    }

    public setUserId(userId: string): this {
        this.userId = userId;
        return this;
    }

    public setRoleId(roleId: string): this {
        this.roleId = roleId;
        return this;
    }

    public setAvalaibleForAppointments(avalaible: boolean): this {
        this.avalaibleForAppointments = avalaible;
        return this;
    }

    public setAvailableWeekDays(days: string[]): this {
        this.availableWeekDays = days;
        return this;
    }

    public setAvailableHours(hours: string[]): this {
        this.availableHours = hours;
        return this;
    }

    public setNonAvailableRange(ranges: string[]): this {
        this.nonAvailableRange = ranges;
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

    public build(): SalonStaff {
        return new SalonStaff(
            this.salonId,
            this.userId,
            this.roleId,
            this.avalaibleForAppointments,
            this.availableWeekDays,
            this.availableHours,
            this.nonAvailableRange,
            this.createdAt,
            this.updatedAt
        );
    }
}

