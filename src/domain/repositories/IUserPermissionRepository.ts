import { UserPermission } from '../entities/UserPermission';

export interface IUserPermissionRepository {
  create(userPermission: UserPermission): Promise<UserPermission>;
  findById(userId: string, permissionId: string): Promise<UserPermission | null>;
  findAll(): Promise<UserPermission[]>;
  update(userPermission: UserPermission): Promise<UserPermission>;
  delete(userId: string, permissionId: string): Promise<void>;
}

