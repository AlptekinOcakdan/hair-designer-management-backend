import { Organisation } from '../../domain/entities/Organisation';

export class OrganisationBuilder {
    private id: string = '';
    private name: string = '';
    private userId: string = '';
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

    public setUserId(userId: string): this {
        this.userId = userId;
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

    public build(): Organisation {
        return new Organisation(
            this.id,
            this.name,
            this.userId,
            this.createdAt,
            this.updatedAt
        );
    }
}
