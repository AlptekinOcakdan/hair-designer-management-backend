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

export class AuthUseCase implements IAuthUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly hashService: IHashService,
        private readonly mailService: IMailService
    ) {
    }

    async register(firstname: string, lastname: string, email: string, password: string, TOSAccepted: boolean): Promise<{
        user: User, accessToken: string, refreshToken: string
    }> {
        // 1. Kullanıcı zaten var mı?
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("Email already in use.");
        }

        // 2. Şifreyi Hashle
        const hashedPassword = await this.hashService.hash(password);

        // 3. User Entity oluştur (UserBuilder kullanarak)
        const newUserEntity = new UserBuilder()
            .setFirstname(firstname)
            .setLastname(lastname)
            .setEmail(email)
            .setPassword(hashedPassword)
            .setTOSAccepted(TOSAccepted)
            .setCreatedAt(new Date())
            .setUpdatedAt(new Date())
            .setEmailVerified(false) // Başlangıçta doğrulanmadı
            .build();

        // 4. Veritabanına kaydet (ID burada oluşup dönecek)
        const createdUser = await this.userRepository.create(newUserEntity);

        // 5. Tokenları üret
        const accessToken = generateAccessToken(createdUser.id!); // ID'nin string olduğunu varsayıyoruz
        const refreshToken = generateRefreshToken(createdUser.id!);

        // 6. Refresh Token'ı kullanıcıya kaydet (Update işlemi)
        // Not: createdUser nesnesi üzerinde refreshToken'ı güncelleyip repoya gönderiyoruz
        createdUser.refreshToken = refreshToken;
        await this.userRepository.update(createdUser);

        // 7. Doğrulama Maili Gönder
        // Not: Gerçek senaryoda buraya bir link veya kod koyulur.
        // Örn: https://api.seninsiten.com/auth/verify?token=${accessToken}
        await this.mailService.sendMail(
            email,
            "Email Verification",
            `<h1>Welcome ${firstname}!</h1><p>Please verify your email.</p>`
        );

        // 8. Sonucu dön
        return {
            user: createdUser,
            accessToken,
            refreshToken
        };
    }

    // --- LOGIN ---
    async login(email: string, password: string, rememberMe: boolean): Promise<{
        user: User, accessToken: string, refreshToken: string
    }> {
        // 1. Kullanıcıyı bul
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials"); // Güvenlik için "User not found" demeyiz
        }

        // 2. Şifreyi Kontrol Et
        const isPasswordValid = await this.hashService.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        // 3. Yeni Tokenları Üret
        // RememberMe true ise AccessToken süresi uzayabilir (veya logic'e göre refresh token ömrü)
        const accessToken = generateAccessToken(user.id!, rememberMe);
        const refreshToken = generateRefreshToken(user.id!);

        // 4. Refresh Token'ı Güncelle
        user.refreshToken = refreshToken;
        await this.userRepository.update(user);

        // 5. Sonucu Dön
        return {
            user,
            accessToken,
            refreshToken
        };
    }

    // ... (Önceki metodlar: register, login)

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

        // 4. Token Rotasyonu: Her yenilemede YENİ refresh token üret
        const newAccessToken = generateAccessToken(user.id!);
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

    // --- FORGOT PASSWORD (Şifremi Unuttum) ---
    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);

        // Güvenlik Notu: Kullanıcı bulunamazsa hata fırlatma!
        // Böylece kötü niyetli kişiler email taraması (user enumeration) yapamaz.
        if (!user) return;

        // 1. Geçici bir erişim tokenı oluştur (Örn: 15 dk geçerli)
        // Bu token şifre sıfırlama linkinde kullanılacak
        const resetToken = generateAccessToken(user.id!);

        // 2. Linki oluştur (Frontend URL yapına göre)
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        // 3. Mail gönder
        await this.mailService.sendMail(
            email,
            "Reset Your Password",
            `<p>Click here to reset your password: <a href="${resetLink}">Reset Password</a></p>`
        );
    }

    // --- RESET PASSWORD (Yeni Şifre Belirleme) ---
    async resetPassword(token: string, newPassword: string): Promise<void> {
        // 1. Tokenı doğrula
        let payload: any;
        try {
            payload = verifyAccessToken(token); // Forgot password için access token kullanmıştık
        } catch (e) {
            throw new Error("Invalid or expired reset token");
        }

        const user = await this.userRepository.findById(payload.userId);
        if (!user) throw new Error("User not found");

        user.password = await this.hashService.hash(newPassword);

        // Güvenlik: Şifre değiştiği an tüm oturumları (refresh tokenları) öldürebiliriz
        user.refreshToken = "";

        await this.userRepository.update(user);
    }

    // --- CHANGE PASSWORD (Profil içinden şifre değişimi) ---
    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error("User not found");

        // 1. Eski şifre doğru mu?
        const isMatch = await this.hashService.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error("Incorrect old password");
        }

        // 2. Yeni şifreyi hashle ve kaydet
        user.password = await this.hashService.hash(newPassword);
        await this.userRepository.update(user);
    }

    // --- CONFIRM EMAIL ---
    async confirmEmail(token: string): Promise<void> {
        // 1. Token doğrulama (Register işleminde accessToken üretip link olarak atmıştık varsayalım)
        let payload: any;
        try {
            payload = verifyAccessToken(token);
        } catch (e) {
            throw new Error("Invalid confirmation token");
        }

        const user = await this.userRepository.findById(payload.userId);
        if (!user) throw new Error("User not found");

        // 2. Durumu güncelle
        if (!user.emailVerified) {
            user.emailVerified = true;
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