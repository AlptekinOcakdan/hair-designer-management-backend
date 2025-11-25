import { Role } from "../../domain/entities/Role";

export interface IRoleUseCase {
    create(roleName: string): Promise<Role>;
    update(role: Role): Promise<Role>;
    getAll(): Promise<Role[]>;
    getById(id: string): Promise<Role | null>;
    delete(id: string): Promise<void>;
}

