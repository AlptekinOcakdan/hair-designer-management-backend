import bcrypt from 'bcryptjs';
import {IHashService} from "../abstract/IHashService";

export class BcryptService implements IHashService {
    private readonly saltRounds: number;

    constructor(saltRounds: number = 10) {
        this.saltRounds = saltRounds;
    }

    async hash(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return bcrypt.hash(password, salt);
        } catch (error) {
            throw new Error('Password hashing failed');
        }
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error('Password comparison failed');
        }
    }
}