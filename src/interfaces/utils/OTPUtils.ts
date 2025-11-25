/**
 * 6 haneli rastgele bir OTP kodu üretir.
 * @returns {string} 6 haneli OTP.
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * OTP'nin geçerlilik süresini hesaplar (mevcut zamandan 10 dakika sonrası).
 * @returns {Date} OTP'nin son geçerlilik tarihi.
 */
export function getOTPExpiration(): Date {
    const OTP_EXPIRATION_MINUTES = 10;
    return new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
}
