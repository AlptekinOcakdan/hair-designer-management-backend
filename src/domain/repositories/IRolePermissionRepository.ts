import { RolePermission } from '../entities/RolePermission';

export interface IRolePermissionRepository {
  create(rolePermission: RolePermission): Promise<RolePermission>;
  findById(roleId: string, permissionId: string): Promise<RolePermission | null>;
  findAll(): Promise<RolePermission[]>;
  update(rolePermission: RolePermission): Promise<RolePermission>;
  delete(roleId: string, permissionId: string): Promise<void>;
}

