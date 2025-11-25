import { Organisation } from "../../domain/entities/Organisation";

export interface IOrganisationUseCase {
    create(userId: string, name: string): Promise<Organisation>;
    update(organisation: Organisation): Promise<Organisation>;
    getAll(): Promise<Organisation[]>;
    getMyOrganisations(userId: string): Promise<Organisation[]>;
    getById(id: string): Promise<Organisation | null>;
    delete(id: string): Promise<void>;
    // Yeni: organisation içindeki salonlar için kazançları getir
    // options.month format: 'YYYY-MM' (ör. '2025-12') — yoksa son 30 gün,
    // options.salonIds: belirtirseniz sadece o salon(lar) için hesaplanır
    getEarnings(
        organisationId: string,
        options?: { month?: string; year?:string; salonIds?: string[] }
    ): Promise<Array<{ salonId: string; salonName?: string; total: string }>>;
}
