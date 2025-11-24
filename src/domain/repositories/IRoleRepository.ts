import { Role } from '../entities/Role';

export interface IRoleRepository {
  create(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  update(role: Role): Promise<Role>;
  delete(id: string): Promise<void>;
}

