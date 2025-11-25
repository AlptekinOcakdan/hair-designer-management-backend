import { Permission } from '../entities/Permission';

export interface IPermissionRepository {
  create(permission: Permission): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  update(permission: Permission): Promise<Permission>;
  delete(id: string): Promise<void>;
}
