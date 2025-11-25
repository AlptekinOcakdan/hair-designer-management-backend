import { IProcedureUseCase } from "../interface/IProcedureUseCase";
import { IProcedureRepository } from "../../domain/repositories/IProcedureRepository";
import { Procedure } from "../../domain/entities/Procedure";
import { ProcedureBuilder } from "../builder/ProcedureBuilder";

export class ProcedureUseCase implements IProcedureUseCase {
    constructor(private readonly procedureRepository: IProcedureRepository) {}

    async create(name: string): Promise<Procedure> {
        const procedure = new ProcedureBuilder()
            .setName(name)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        return this.procedureRepository.create(procedure);
    }

    async update(procedure: Procedure): Promise<Procedure> {
        procedure.updatedAt = new Date();
        return this.procedureRepository.update(procedure);
    }

    async getAll(): Promise<Procedure[]> {
        return this.procedureRepository.findAll();
    }

    async getById(id: string): Promise<Procedure | null> {
        return this.procedureRepository.findById(id);
    }

    async delete(id: string): Promise<void> {
        await this.procedureRepository.delete(id);
    }
}

