import { eq } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import {UserDocument, UserInsert, usersTable} from "./model/UserModel";
import {db} from "../../../config/DrizzleConfig";

export class DrizzleUserRepository implements IUserRepository {

    // Entity'den Drizzle Insert Tipine Dönüştürücü (Mapper)
    private toPersistence(user: User): UserInsert {
        return {
            id: user.id ? user.id : undefined, // Eğer ID yoksa DB üretsin
            username: user.username,
            email: user.email,
            password: user.password,
            refreshToken: user.refreshToken,
            createdAt: user.createdAt || new Date(),
        };
    }

    // Drizzle Document Tipinden Domain Entity'sine Dönüştürücü (Mapper)
    private toDomain(userDoc: UserDocument): User {
        return new User(
            userDoc.id,
            userDoc.username,
            userDoc.email,
            userDoc.password,
            userDoc.refreshToken || "", // Nullable kontrolü
            userDoc.createdAt
        );
    }

    async create(user: User): Promise<UserDocument> {
        // Mongoose pre-save hook yerine buraya ekliyoruz:
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(user.password, salt);

        // Şifreyi güncelleyerek persistence nesnesini hazırla
        const persistenceUser = this.toPersistence(user);
        persistenceUser.password = hashedPassword;

        // Veritabanına yaz ve yazılan veriyi geri döndür (returning)
        const [createdUser] = await db
            .insert(usersTable)
            .values(persistenceUser)
            .returning();

        return createdUser;
    }

    async findById(id: string): Promise<User | null> {
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);

        if (!user) return null;
        return this.toDomain(user);
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (!user) return null;
        return user;
    }

    async findAll(): Promise<User[]> {
        const users = await db.select().from(usersTable);
        return users.map(user => this.toDomain(user));
    }

    async findByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.refreshToken, refreshToken))
            .limit(1);

        if (!user) return null;
        return user;
    }

    async findByIdAndUpdateRefreshToken(id: string, refreshToken: string): Promise<UserDocument | null> {
        const [updatedUser] = await db
            .update(usersTable)
            .set({ refreshToken: refreshToken })
            .where(eq(usersTable.id, id))
            .returning()

        if (!updatedUser) return null;
        return updatedUser;
    }
}