import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import {UserDocument, UserInsert, usersTable} from "./model";
import {NeonHttpDatabase} from "drizzle-orm/neon-http";
import * as schema from "./model/UserModel";
import {eq} from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
    private readonly table: typeof usersTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof usersTable
    ) {
        this.table = table;
    }
    private toPersistence(user: User): UserInsert {
        return {
            id: user.id ? user.id : undefined,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            refreshToken: user.refreshToken,
            createdAt: user.createdAt ? user.createdAt : undefined,
            updatedAt: user.updatedAt ? user.updatedAt : undefined,
        };
    }

    private toDomain(userDoc: UserDocument): User {
        return new User(
            userDoc.id,
            userDoc.firstname,
            userDoc.lastname,
            userDoc.email,
            userDoc.phoneNumber,
            userDoc.emailVerified,
            userDoc.phoneVerified,
            userDoc.refreshToken,
            userDoc.TOSAccepted,
            userDoc.createdAt,
            userDoc.updatedAt
        );
    }

    async create(user: User): Promise<User> {
        const persistenceUser = this.toPersistence(user);

        const [insertedUser] = await this.db
            .insert(this.table)
            .values(persistenceUser)
            .returning();

        return this.toDomain(insertedUser);
    }

    // --- READ (ID ile Bulma) ---
    async findById(id: string): Promise<User | null> {
        const [userFound] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id));

        if (!userFound) return null;

        return this.toDomain(userFound);
    }

    // --- READ (Email ile Bulma) ---
    async findByEmail(email: string): Promise<User | null> {
        const [userFound] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.email, email));

        if (!userFound) return null;

        return this.toDomain(userFound);
    }

    // --- READ (Refresh Token ile Bulma) ---
    async findByRefreshToken(refreshToken: string): Promise<User | null> {
        const [userFound] = await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.refreshToken, refreshToken));

        if (!userFound) return null;

        return this.toDomain(userFound);
    }

    // --- READ ALL (Tümünü Getir) ---
    // NOT: Interface'inde UserDocument[] döneceğini belirtmişsin.
    // Genelde burası da User[] (Domain Entity) döner ama isteğine sadık kalarak raw data dönüyorum.
    async findAll(): Promise<UserDocument[]> {
        return this.db.select().from(this.table);
    }

    // --- UPDATE (Güncelleme) ---
    async update(user: User): Promise<User> {
        // Güncelleme yapabilmek için ID'nin varlığından emin olmalıyız
        if (!user.id) {
            throw new Error("User ID is required for update operation.");
        }

        // Domain entity'yi DB formatına çevir
        const persistenceUser = this.toPersistence(user);

        // Update sorgusu: ID'si eşleşen satırı güncelle ve yeni halini döndür
        const [updatedUser] = await this.db
            .update(this.table)
            .set(persistenceUser)
            .where(eq(this.table.id, user.id))
            .returning();

        // Güncellenen veriyi tekrar Domain formatına çevirip dön
        return this.toDomain(updatedUser);
    }

    // --- DELETE (Silme) ---
    async delete(id: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(eq(this.table.id, id));
    }
}