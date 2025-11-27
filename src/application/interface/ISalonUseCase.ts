import { Salon } from "../../domain/entities/Salon";

export interface ISalonUseCase {
    create(organisationId: string, name: string, location: string): Promise<Salon>;
    update(salon: Salon): Promise<Salon>;
    getAll(): Promise<Salon[]>;
    getByOrganisationId(organisationId: string): Promise<Salon[]>;
    getById(id: string): Promise<Salon | null>;
    delete(id: string): Promise<void>;
}

