import { ISalonUseCase } from "../interface/ISalonUseCase";
import { ISalonRepository } from "../../domain/repositories/ISalonRepository";
import { Salon } from "../../domain/entities/Salon";
import { SalonBuilder } from "../builder/SalonBuilder";

export class SalonUseCase implements ISalonUseCase {
    constructor(private readonly salonRepository: ISalonRepository) {}

    async create(organisationId: string, location: string): Promise<Salon> {
        const salon = new SalonBuilder()
            .setOrganisationId(organisationId)
            .setLocation(location)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        return this.salonRepository.create(salon);
    }

    async update(salon: Salon): Promise<Salon> {
        salon.updatedAt = new Date();
        return this.salonRepository.update(salon);
    }

    async getAll(): Promise<Salon[]> {
        return this.salonRepository.findAll();
    }

    async getByOrganisationId(organisationId: string): Promise<Salon[]> {
        return this.salonRepository.findByOrganisationId(organisationId);
    }

    async getById(id: string): Promise<Salon | null> {
        return this.salonRepository.findById(id);
    }

    async delete(id: string): Promise<void> {
        await this.salonRepository.delete(id);
    }
}

