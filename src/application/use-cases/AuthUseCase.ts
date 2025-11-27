import {IUserRepository} from "../../domain/repositories/IUserRepository";
import {IAuthUseCase} from "../interface/IAuthUseCase";
import {IHashService} from "../../domain/services/abstract/IHashService";
import {User} from "../../domain/entities/User";
import {IMailService} from "../../domain/services/abstract/IMailService";
import {UserBuilder} from "../builder/UserBuilder";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from "../../interfaces/utils/jwtUtils";
import {IOTPRepository} from "../../domain/repositories/IOTPRepository";
import {generateOTP, getOTPExpiration} from "../../interfaces/utils/OTPUtils";
import {OTP} from "../../domain/entities/OTP";
import {randomUUID} from "crypto";
import {IUserRoleRepository} from "../../domain/repositories/IUserRoleRepository";
import {IRoleRepository} from "../../domain/repositories/IRoleRepository";

export class AuthUseCase implements IAuthUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly hashService: IHashService,
        private readonly mailService: IMailService,
        private readonly otpRepository: IOTPRepository,
        private readonly userRoleRepository: IUserRoleRepository,
        private readonly roleRepository: IRoleRepository,
    ) {
    }

    async register(firstname: string, lastname: string, email: string, TOSAccepted: boolean): Promise<{
        user: User
    }> {
        // 1. Kullanıcı zaten var mı?
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("Email already in use.");
        }

        // 3. User Entity oluştur (UserBuilder kullanarak)
        const newUserEntity = new UserBuilder()
            .setFirstname(firstname)
            .setLastname(lastname)
            .setEmail(email)
            .setTOSAccepted(TOSAccepted)
            .setCreatedAt(new Date())
            .setUpdatedAt(new Date())
            .setEmailVerified(false) // Başlangıçta doğrulanmadı
            .build();

        // 4. Veritabanına kaydet (ID burada oluşup dönecek)
        const createdUser = await this.userRepository.create(newUserEntity);

        // 5. OTP Oluştur ve Kaydet
        const otpCode = generateOTP();
        const otpExpiresAt = getOTPExpiration();
        const otpEntity = new OTP(randomUUID(), otpCode, createdUser.id!, otpExpiresAt, false, new Date(), null);
        await this.otpRepository.create(otpEntity);

        // 7. Doğrulama Maili Gönder
        await this.mailService.sendMail(
            email,
            "Hesabınızı Doğrulayın",
            `<h1>Hoş Geldiniz ${firstname}!</h1><p>Hesabınızı doğrulamak için tek kullanımlık kodunuz: <strong>${otpCode}</strong></p>`
        );

        // 8. Sonucu dön
        return {
            user: createdUser,
        };
    }

    // --- LOGIN ---
    async login(email: string): Promise<{
        user: User
    }> {
        // 1. Kullanıcıyı bul
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials"); // Güvenlik için "User not found" demeyiz
        }

        // 2. OTP Oluştur, Kaydet ve Gönder
        const otpCode = generateOTP();
        const otpExpiresAt = getOTPExpiration();
        const otpEntity = new OTP(randomUUID(), otpCode, user.id!, otpExpiresAt, false, new Date(), null);
        await this.otpRepository.create(otpEntity);

        await this.mailService.sendMail(
            email,
            "Giriş Kodunuz",
            `<h1>Giriş Kodunuz</h1><p>Giriş yapmak için tek kullanımlık kodunuz: <strong>${otpCode}</strong></p>`
        );

        // 5. Sonucu Dön
        return {
            user,
        };
    }

    // --- VERIFY OTP ---
    async verifyOTP(email: string, otpCode: string, rememberMe:boolean): Promise<{
        user: User, accessToken: string, refreshToken: string
    }> {
        // 1. Kullanıcıyı bul
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // 2. OTP'yi doğrula
        const otpRecord = await this.otpRepository.findActiveByUserId(user.id!);
        if (!otpRecord || otpRecord.code !== otpCode) {
            throw new Error("Invalid or expired OTP");
        }

        // OTP kullanıldı olarak işaretle
        otpRecord.isValidated = true;
        await this.otpRepository.update(otpRecord);

        // --- ROL ÇEKME İŞLEMİ ---
        const userRoles = await this.userRoleRepository.findByUserId(user.id!);
        const roles = await Promise.all(userRoles.map(async (ur) => {
            const role = await this.roleRepository.findById(ur.roleId);
            return role ? role.role : null;
        }));
        const validRoles = roles.filter((r): r is string => r !== null);

        // 3. Token'ları oluştur (Roller ile)
        const accessToken = generateAccessToken(user.id!, validRoles, rememberMe);
        const refreshToken = generateRefreshToken(user.id!);

        // 4. Refresh token'ı kullanıcıya işle
        user.refreshToken = refreshToken;
        user.emailVerified = true; // Doğrulama başarılı ise email'i doğrulanmış yap
        await this.userRepository.update(user);

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    // --- REFRESH TOKEN (Token Yenileme) ---
    async refreshToken(token: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            verifyRefreshToken(token);
        } catch (e) {
            throw new Error("Invalid or expired refresh token");
        }

        // 2. Token içindeki ID ile kullanıcıyı bul
        const user = await this.userRepository.findByRefreshToken(token);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.refreshToken !== token) {
            // Güvenlik ihlali: Mevcut oturumu da öldür
            user.refreshToken = "";
            await this.userRepository.update(user);
            throw new Error("Invalid refresh token reuse detected");
        }

        // --- ROL ÇEKME İŞLEMİ ---
        const userRoles = await this.userRoleRepository.findByUserId(user.id!);
        const roles = await Promise.all(userRoles.map(async (ur) => {
            const role = await this.roleRepository.findById(ur.roleId);
            return role ? role.role : null;
        }));
        const validRoles = roles.filter((r): r is string => r !== null);

        // 4. Token Rotasyonu: Her yenilemede YENİ refresh token üret
        const newAccessToken = generateAccessToken(user.id!, validRoles);
        const newRefreshToken = generateRefreshToken(user.id!);

        // 5. Yeni token'ı veritabanına işle
        user.refreshToken = newRefreshToken;
        await this.userRepository.update(user);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    // --- LOGOUT ---
    async logout(token: string): Promise<void> {
        try {
            verifyRefreshToken(token);
        } catch (e) {
            throw new Error("Invalid or expired refresh token");
        }
        const user = await this.userRepository.findByRefreshToken(token);
        if (user) {
            // Veritabanındaki refresh token'ı silerek oturumu sonlandır
            user.refreshToken = "";
            await this.userRepository.update(user);
        }
    }

    // --- CONFIRM PHONE NUMBER ---
    async confirmPhoneNumber(token: string): Promise<void> {
        // Mantık email ile aynı, genellikle SMS ile gelen OTP veya token kullanılır.
        // Burada string token varsayımıyla JWT çözüyoruz:
        let payload: any;
        try {
            payload = verifyAccessToken(token);
        } catch (e) {
            throw new Error("Invalid token");
        }

        const user = await this.userRepository.findById(payload.userId);
        if (!user) throw new Error("User not found");

        if (!user.phoneVerified) {
            user.phoneVerified = true;
            await this.userRepository.update(user);
        }
    }
}