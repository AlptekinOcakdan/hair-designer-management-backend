import { IOTPRepository } from '../../../domain/repositories/IOTPRepository';
import { OTP } from '../../../domain/entities/OTP';
import { OTPDocument, OTPInsert, otpsTable } from './model/OTPModel';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './model/OTPModel';
import { and, eq, gte, desc } from 'drizzle-orm';

export class DrizzleOTPRepository implements IOTPRepository {
    private readonly table: typeof otpsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof otpsTable
    ) {
        this.table = table;
    }

    private toPersistence(otp: OTP): OTPInsert {
        return {
            id: otp.id,
            code: otp.code,
            userId: otp.userId,
            expiresAt: otp.expiresAt,
            isValidated: otp.isValidated,
            createdAt: otp.createdAt,
            updatedAt: otp.updatedAt,
        };
    }

    private toDomain(otpDoc: OTPDocument): OTP {
        return new OTP(
            otpDoc.id,
            otpDoc.code,
            otpDoc.userId,
            otpDoc.expiresAt,
            otpDoc.isValidated,
            otpDoc.createdAt,
            otpDoc.updatedAt
        );
    }

    async create(otp: OTP): Promise<OTP> {
        const persistenceOTP = this.toPersistence(otp);
        const [insertedOTP] = await this.db
            .insert(this.table)
            .values(persistenceOTP)
            .returning();
        return this.toDomain(insertedOTP);
    }

    async findById(id: string): Promise<OTP | null> {
        const [otpFound] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));
        return otpFound ? this.toDomain(otpFound) : null;
    }

    async findActiveByUserId(userId: string): Promise<OTP | null> {
        const [otpFound] = await this.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.userId, userId),
                    eq(this.table.isValidated, false),
                    gte(this.table.expiresAt, new Date())
                )
            )
            .orderBy(desc(this.table.createdAt))
            .limit(1);
        return otpFound ? this.toDomain(otpFound) : null;
    }

    async update(otp: OTP): Promise<OTP> {
        if (!otp.id) {
            throw new Error("OTP ID is required for update operation.");
        }
        const persistenceOTP = this.toPersistence(otp);
        const [updatedOTP] = await this.db
            .update(this.table)
            .set(persistenceOTP)
            .where(eq(this.table.id, otp.id))
            .returning();
        return this.toDomain(updatedOTP);
    }

    async delete(id: string): Promise<void> {
        await this.db.delete(this.table).where(eq(this.table.id, id));
    }
}

