import { IRoleUseCase } from "../interface/IRoleUseCase";
import { IRoleRepository } from "../../domain/repositories/IRoleRepository";
import { Role } from "../../domain/entities/Role";
import { RoleBuilder } from "../builder/RoleBuilder";

export class RoleUseCase implements IRoleUseCase {
    constructor(private readonly roleRepository: IRoleRepository) {}

    async create(roleName: string): Promise<Role> {
        const role = new RoleBuilder()
            .setRole(roleName)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        return this.roleRepository.create(role);
    }

    async update(role: Role): Promise<Role> {
        role.updatedAt = new Date();
        return this.roleRepository.update(role);
    }

    async getAll(): Promise<Role[]> {
        return this.roleRepository.findAll();
    }

    async getById(id: string): Promise<Role | null> {
        return this.roleRepository.findById(id);
    }

    async delete(id: string): Promise<void> {
        await this.roleRepository.delete(id);
    }
}

