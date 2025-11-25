import { Role } from '../../domain/entities/Role';

export class RoleBuilder {
    private id: string = '';
    private role: string = '';
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setId(id: string): this {
        this.id = id;
        return this;
    }

    public setRole(role: string): this {
        this.role = role;
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

    public build(): Role {
        return new Role(
            this.id,
            this.role,
            this.createdAt,
            this.updatedAt
        );
    }
}
