import {IUserRepository} from "../../domain/repositories/IUserRepository";
import {User} from "../../domain/entities/User";
import {IUserUseCase} from "../interface/IUserUseCase";
import {NotFoundError} from "../../interfaces/errors/NotFoundError";
import bcryptjs from "bcryptjs";
import {BadRequestError} from "../../interfaces/errors/BadRequestError";
import {UserBuilder} from "../builder/UserBuilder";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../../interfaces/utils/jwtUtils";
import {UnAuthorizedError} from "../../interfaces/errors/UnAuthorizedError";

export class UserUseCase implements IUserUseCase {
    constructor(private userRepository: IUserRepository) {
    }

    async createUser(userData: {
        username: string;
        email: string;
        password: string;
    }): Promise<{ accessToken: string; refreshToken: string }> {
        const user = new UserBuilder()
            .setUsername(userData.username)
            .setEmail(userData.email)
            .setPassword(userData.password)
            .setCreatedAt(new Date())
            .build();

        const savedUser = await this.userRepository.create(user);
        const accessToken = generateAccessToken(savedUser.id);
        const refreshToken = generateRefreshToken(savedUser.id);

        savedUser.refreshToken = refreshToken;
        await this.userRepository.findByIdAndUpdateRefreshToken(savedUser.id, refreshToken);
        return {accessToken: accessToken, refreshToken: refreshToken};
    }

    async getUser(userId: string): Promise<User | null> {
        const user = await this.userRepository.findById(userId);
        return user ? user : null;
    }

    async loginUser(
        email: string,
        password: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const loginUser = await this.userRepository.findByEmail(email);
        if (loginUser == null) {
            throw new NotFoundError("user not found");
        }
        const isSamePassword = this.comparePassword(password, loginUser.password);
        if (!isSamePassword) {
            throw new BadRequestError("Incorrect email or password");
        }
        const accessToken = generateAccessToken(loginUser.id);
        const refreshToken = generateRefreshToken(loginUser.id);

        loginUser.refreshToken = refreshToken;
        await this.userRepository.findByIdAndUpdateRefreshToken(loginUser.id, refreshToken);
        return {accessToken: accessToken, refreshToken: refreshToken};
    }

    async refreshAccessToken(
        refreshToken: string
    ): Promise<{ accessToken: string }> {
        const user = await this.userRepository.findByRefreshToken(refreshToken);
        if (!user) throw new UnAuthorizedError("Invalid refresh token");
        const accessToken = generateAccessToken(user.id);
        return {accessToken};
    }

    async logout(
        refreshToken: string
    ): Promise<Boolean> {
        const user = await this.userRepository.findByRefreshToken(refreshToken);
        if (!user) return false
        user.refreshToken = '';
        await this.userRepository.findByIdAndUpdateRefreshToken(user.id, user.refreshToken);
        return true;
    }

    async comparePassword(
        password: string,
        hashPassword: string
    ): Promise<Boolean> {
        return bcryptjs.compare(password, hashPassword);
    }
}
