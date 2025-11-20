import {IUserRepository} from '../../domain/repositories/IUserRepository';
import {DrizzleUserRepository} from "../../infrastructure/databases/drizzle/DrizzleUserRepository";

export class UserRepositoryFactory {
    public static create(): IUserRepository {
        return new DrizzleUserRepository();
    }
}
