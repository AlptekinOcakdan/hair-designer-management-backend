import { StaffProcedure } from '../../domain/entities/StaffProcedure';

export class StaffProcedureBuilder {
    private userId: string = '';
    private procedureId: string = '';
    private duration: number = 0;
    private price: string = "";
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setUserId(userId: string): this {
        this.userId = userId;
        return this;
    }

    public setProcedureId(procedureId: string): this {
        this.procedureId = procedureId;
        return this;
    }

    public setDuration(duration: number): this {
        this.duration = duration;
        return this;
    }

    public setPrice(price: string): this {
        this.price = price;
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

    public build(): StaffProcedure {
        return new StaffProcedure(
            this.userId,
            this.procedureId,
            this.duration,
            this.price,
            this.createdAt,
            this.updatedAt
        );
    }
}

