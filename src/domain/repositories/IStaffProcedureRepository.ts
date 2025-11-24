import { StaffProcedure } from "../entities/StaffProcedure";

export interface IStaffProcedureRepository {
    create(staffProcedure: StaffProcedure): Promise<StaffProcedure>;
    // composite key: userId + procedureId
    findById(userId: string, procedureId: string): Promise<StaffProcedure | null>;
    findAll(): Promise<StaffProcedure[]>;
    update(staffProcedure: StaffProcedure): Promise<StaffProcedure>;
    delete(userId: string, procedureId: string): Promise<void>;
}

