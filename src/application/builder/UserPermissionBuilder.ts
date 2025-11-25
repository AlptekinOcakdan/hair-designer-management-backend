import { UserPermission } from '../../domain/entities/UserPermission';

export class UserPermissionBuilder {
    private userId: string = '';
    private permissionId: string = '';
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setUserId(userId: string): this {
        this.userId = userId;
        return this;
    }

    public setPermissionId(permissionId: string): this {
        this.permissionId = permissionId;
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

    public build(): UserPermission {
        return new UserPermission(
            this.userId,
            this.permissionId,
            this.createdAt,
            this.updatedAt
        );
    }
}

