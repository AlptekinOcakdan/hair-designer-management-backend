import { OTP } from '../entities/OTP';

export interface IOTPRepository {
    create(otp: OTP): Promise<OTP>;
    findById(id: string): Promise<OTP | null>;
    findActiveByUserId(userId: string): Promise<OTP | null>;
    update(otp: OTP): Promise<OTP>;
    delete(id: string): Promise<void>;
}

