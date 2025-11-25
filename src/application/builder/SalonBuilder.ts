import { Salon } from '../../domain/entities/Salon';

export class SalonBuilder {
    private id: string = '';
    private name: string = '';
    private location: string = '';
    private organisationId: string = '';
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

    public setLocation(location: string): this {
        this.location = location;
        return this;
    }

    public setOrganisationId(organisationId: string): this {
        this.organisationId = organisationId;
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

    public build(): Salon {
        return new Salon(
            this.id,
            this.name,
            this.location,
            this.organisationId,
            this.createdAt,
            this.updatedAt
        );
    }
}

