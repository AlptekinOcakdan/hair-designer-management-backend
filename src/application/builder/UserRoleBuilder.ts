import {UserRole} from "../../domain/entities/UserRole";

export class UserRoleBuilder {
    private id: number= 0;
    private userId: string = '';
    private roleId: string = '';
    private organisationId: string | null = null;
    private salonId: string | null = null;
    private createdAt: Date = new Date();
    private updatedAt: Date | null = null;

    public setId(id: number): this {
        this.id = id;
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

    public setOrganisationId(organisationId: string | null): this {
        this.organisationId = organisationId;
        return this;
    }

    public setSalonId(salonId: string | null): this {
        this.salonId = salonId;
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

    public build(): UserRole {
        return new UserRole(
            this.id,
            this.userId,
            this.roleId,
            this.organisationId,
            this.salonId,
            this.createdAt,
            this.updatedAt
        );
    }
}