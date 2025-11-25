import {UserRole} from "../entities/UserRole";

export interface IUserRoleRepository {
    create(userRole: UserRole): Promise<UserRole>;
    findById(userId: string, roleId: string): Promise<UserRole | null>;
    findByUserId(userId: string): Promise<UserRole[]>;
    findByRoleId(roleId: string): Promise<UserRole[]>;
    findByOrganisationId(organisationId: string): Promise<UserRole[]>;
    findBySalonId(salonId: string): Promise<UserRole[]>;
    findAll(): Promise<UserRole[]>;
    update(userRole: UserRole): Promise<UserRole>;
    delete(userId: string, roleId: string): Promise<void>;
}