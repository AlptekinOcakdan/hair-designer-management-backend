import {IUserRepository} from "../../domain/repositories/IUserRepository";
import {User} from "../../domain/entities/User";
import {IUserUseCase} from "../interface/IUserUseCase";

export class UserUseCase implements IUserUseCase {
    constructor(private userRepository: IUserRepository) {
    }

    createUser(userData: { username: string; email: string; password: string; }): Promise<{ accessToken: string; refreshToken: string; }> {
        throw new Error("Method not implemented.");
    }
    getUser(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }


}
