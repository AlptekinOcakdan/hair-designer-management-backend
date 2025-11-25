import { RolePermission } from '../../domain/entities/RolePermission';

export class RolePermissionBuilder {
    private roleId: string = '';
    private permissionId: string = '';
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setRoleId(roleId: string): this {
        this.roleId = roleId;
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

    public build(): RolePermission {
        return new RolePermission(
            this.roleId,
            this.permissionId,
            this.createdAt,
            this.updatedAt
        );
    }
}

