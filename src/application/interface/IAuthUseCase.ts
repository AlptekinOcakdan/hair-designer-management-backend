import {User} from "../../domain/entities/User";

export interface IAuthUseCase {
    register(firstname:string, lastname:string, email: string, password: string, TOSAccepted:boolean): Promise<{
        user:User, accessToken:string, refreshToken:string;
    }>;
    login(email: string, password: string, rememberMe:boolean): Promise<{
        user:User, accessToken:string, refreshToken:string
    }>;
    logout(token: string): Promise<void>;
    refreshToken(token: string): Promise<{accessToken:string, refreshToken:string}>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    confirmEmail(token: string): Promise<void>;
    confirmPhoneNumber(token: string): Promise<void>;
}