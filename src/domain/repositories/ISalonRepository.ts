import { Salon } from '../entities/Salon';

export interface ISalonRepository {
  create(salon: Salon): Promise<Salon>;
  findById(id: string): Promise<Salon | null>;
  findAll(): Promise<Salon[]>;
  findByOrganisationId(organisationId: string): Promise<Salon[]>;
  update(salon: Salon): Promise<Salon>;
  delete(id: string): Promise<void>;
}

