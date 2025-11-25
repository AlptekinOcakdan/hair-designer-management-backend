import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { Permission } from '../../domain/entities/Permission';
import { IPermissionUseCase } from '../interface/IPermissionUseCase';
import { randomUUID } from 'crypto';
import { PermissionBuilder } from '../builder/PermissionBuilder';

export class PermissionUseCase implements IPermissionUseCase {
    constructor(
        private permissionRepository: IPermissionRepository,
    ) {}

    async create(name: string): Promise<Permission> {
        const permission = new PermissionBuilder()
            .setId(randomUUID())
            .setAction(name)
            .setDescription('')
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        return this.permissionRepository.create(permission);
    }

    async getById(id: string): Promise<Permission | null> {
        return this.permissionRepository.findById(id);
    }

    async getAll(): Promise<Permission[]> {
        return this.permissionRepository.findAll();
    }

    async update(permission: Permission): Promise<Permission> {
        permission.updatedAt = new Date();
        return this.permissionRepository.update(permission);
    }

    async delete(id: string): Promise<void> {
        return this.permissionRepository.delete(id);
    }
}
