import { SalonStaff } from "../entities/SalonStaff";

export interface ISalonStaffRepository {
    create(salonStaff: SalonStaff): Promise<SalonStaff>;
    findById(salonId: string, userId: string): Promise<SalonStaff | null>;
    findAll(): Promise<SalonStaff[]>;
    update(salonStaff: SalonStaff): Promise<SalonStaff>;
    delete(salonId: string, userId: string): Promise<void>;
}