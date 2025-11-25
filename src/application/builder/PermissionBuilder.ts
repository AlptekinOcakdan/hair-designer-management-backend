import { Permission } from '../../domain/entities/Permission';

export class PermissionBuilder {
    private id: string = '';
    private action: string = '';
    private description: string = '';
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setId(id: string): this {
        this.id = id;
        return this;
    }

    public setAction(action: string): this {
        this.action = action;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description;
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

    public build(): Permission {
        return new Permission(
            this.id,
            this.action,
            this.description,
            this.createdAt,
            this.updatedAt
        );
    }
}
