import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "../../infrastructure/databases/drizzle/model/OrganisationModel"
import {organisationsTable} from "../../infrastructure/databases/drizzle/model";
import {IOrganisationRepository} from "../../domain/repositories/IOrganisationRepository";
import {DrizzleOrganisationRepository} from "../../infrastructure/databases/drizzle/DrizzleOrganisationRepository";

export class OrganisationRepositoryFactory {
    public static create(
        db: NeonHttpDatabase<typeof schema>,
        table: typeof organisationsTable
    ): IOrganisationRepository {
        return new DrizzleOrganisationRepository(db, table);
    }
}