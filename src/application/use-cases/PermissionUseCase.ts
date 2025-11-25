import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { Permission } from '../../domain/entities/Permission';
import { IPermissionUseCase } from '../interface/IPermissionUseCase';
import { randomUUID } from 'crypto';
import { PermissionBuilder } from '../builder/PermissionBuilder';
import { IRolePermissionRepository } from '../../domain/repositories/IRolePermissionRepository';
import { IUserPermissionRepository } from '../../domain/repositories/IUserPermissionRepository';
import { ISalonStaffRepository } from '../../domain/repositories/ISalonStaffRepository';
import { RolePermissionBuilder } from '../builder/RolePermissionBuilder';
import { UserPermissionBuilder } from '../builder/UserPermissionBuilder';

export class PermissionUseCase implements IPermissionUseCase {
    constructor(
        private permissionRepository: IPermissionRepository,
        private rolePermissionRepository: IRolePermissionRepository,
        private userPermissionRepository: IUserPermissionRepository,
        private salonStaffRepository: ISalonStaffRepository
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

    async relateToRole(roleId: string, permissionId: string): Promise<void> {
        const existingRP = await this.rolePermissionRepository.findById(roleId, permissionId);
        if (!existingRP) {
            const rp = new RolePermissionBuilder()
                .setRoleId(roleId)
                .setPermissionId(permissionId)
                .setCreatedAt(new Date())
                .setUpdatedAt(null)
                .build();
            await this.rolePermissionRepository.create(rp);
        }

        const allStaff = await this.salonStaffRepository.findAll();
        const matchedStaff = allStaff.filter(s => s.roleId === roleId);

        for (const staff of matchedStaff) {
            const userId = staff.userId;
            const existingUP = await this.userPermissionRepository.findById(userId, permissionId);
            if (!existingUP) {
                const up = new UserPermissionBuilder()
                    .setUserId(userId)
                    .setPermissionId(permissionId)
                    .setCreatedAt(new Date())
                    .setUpdatedAt(null)
                    .build();
                await this.userPermissionRepository.create(up);
            }
        }
    }
}
