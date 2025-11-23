import { User } from "../../domain/entities/User";
export interface IUserUseCase {
  createUser(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }>;
  getUser(userId: string): Promise<User | null>;
}
