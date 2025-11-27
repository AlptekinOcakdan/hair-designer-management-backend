import { Permission } from '../../domain/entities/Permission';

export interface IPermissionUseCase {
  create(name: string, description: string): Promise<Permission>;
  getById(id: string): Promise<Permission | null>;
  getAll(): Promise<Permission[]>;
  update(permission: Permission): Promise<Permission>;
  delete(id: string): Promise<void>;
}
