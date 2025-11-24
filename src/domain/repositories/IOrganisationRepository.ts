import { Organisation } from '../entities/Organisation';

export interface IOrganisationRepository {
  create(organisation: Organisation): Promise<Organisation>;
  findById(id: string): Promise<Organisation | null>;
  findAll(): Promise<Organisation[]>;
  findByUserId(userId: string): Promise<Organisation[]>;
  update(organisation: Organisation): Promise<Organisation>;
  delete(id: string): Promise<void>;
}

