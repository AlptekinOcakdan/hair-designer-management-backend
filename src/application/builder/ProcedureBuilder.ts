import { Procedure } from '../../domain/entities/Procedure';

export class ProcedureBuilder {
    private id: string = '';
    private name: string = '';
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setId(id: string): this {
        this.id = id;
        return this;
    }

    public setName(name: string): this {
        this.name = name;
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

    public build(): Procedure {
        return new Procedure(
            this.id,
            this.name,
            this.createdAt,
            this.updatedAt
        );
    }
}

