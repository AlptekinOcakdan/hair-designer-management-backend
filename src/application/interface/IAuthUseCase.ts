import {User} from "../../domain/entities/User";

export interface IAuthUseCase {
    register(firstname:string, lastname:string, email: string, TOSAccepted:boolean): Promise<{
        user:User
    }>;
    login(email: string): Promise<{
        user:User
    }>;
    verifyOTP(email: string, otpCode: string, rememberMe: boolean): Promise<{
        user:User, accessToken:string, refreshToken:string
    }>;
    logout(token: string): Promise<void>;
    refreshToken(token: string): Promise<{accessToken:string, refreshToken:string}>;
    confirmPhoneNumber(token: string): Promise<void>;
}