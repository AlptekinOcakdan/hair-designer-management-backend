import { Procedure } from "../../domain/entities/Procedure";

export interface IProcedureUseCase {
    create(name: string): Promise<Procedure>;
    update(procedure: Procedure): Promise<Procedure>;
    getAll(): Promise<Procedure[]>;
    getById(id: string): Promise<Procedure | null>;
    delete(id: string): Promise<void>;
}

