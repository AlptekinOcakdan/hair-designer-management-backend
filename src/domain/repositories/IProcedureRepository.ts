import { Procedure } from '../entities/Procedure';

export interface IProcedureRepository {
  create(procedure: Procedure): Promise<Procedure>;
  findById(id: string): Promise<Procedure | null>;
  findAll(): Promise<Procedure[]>;
  update(procedure: Procedure): Promise<Procedure>;
  delete(id: string): Promise<void>;
}

