import { User } from "../../domain/entities/User";
import { Procedure } from "../../domain/entities/Procedure";

export interface IUserUseCase {
    assignRoleToUser(userId: string, roleId: string, organisationId: string| null, salonId: string | null): Promise<void>;
    // Yeni kullanıcı oluşturup aynı anda verilen salon ve role ile SalonStaff kaydı oluşturur.
    // staffOptions opsiyoneldir (availableForAppointments, availableWeekDays, availableHours, nonAvailableRange)
    createAndAssignToSalon(
        userData: Partial<User>,
        salonId: string,
        roleId: string,
        staffOptions?: {
            availableForAppointments?: boolean;
            availableWeekDays?: string[];
            availableHours?: string[];
            nonAvailableRange?: string[];
        }
    ): Promise<User>;

    // Var olan kullanıcıyı verilen salon ve role ile SalonStaff tablosuna ekler.
    assignUserToSalon(
        userId: string,
        salonId: string,
        roleId: string,
        staffOptions?: {
            availableForAppointments?: boolean;
            availableWeekDays?: string[];
            availableHours?: string[];
            nonAvailableRange?: string[];
        }
    ): Promise<void>;

    // Yeni: kullanıcının çalışacağı hafta günleri ve saatlerini ayarlar
    setWorkingSchedule(
        userId: string,
        salonId: string,
        availableWeekDays: string[],
        availableHours: string[]
    ): Promise<void>;

    // Yeni: availableForAppointments alanını true/false olarak değiştirir
    setAvailableForAppointments(
        userId: string,
        salonId: string,
        available: boolean
    ): Promise<void>;

    // Yeni: nonAvailableRange ekler (start, end). Bu aralıktaki randevuları iptal eder ve müşterilere e-posta yollar.
    // reason: iptal nedeni; performedBy: userId yapan kişinin id'si (ör. salon staff)
    setNonAvailableRange(
        userId: string,
        salonId: string,
        start: string | Date,
        end: string | Date,
        reason: string
    ): Promise<void>;

    // Yeni metotlar:
    // 1) Salon personeli bir kullanıcı için yapılan prosedürü kaydeder (duration dakika, price)
    staffAddPerformedProcedure(
        staffId: string,
        procedureId: string,
        durationMinutes: number,
        price: string
    ): Promise<void>;

    // 2) Kullanıcı, bir salondaki personeli ve onların hangi prosedürleri yaptığı bilgisini alır
    // Her kayıt: staffId, firstname, lastname ve Procedure entity dizisi
    getStaffProceduresInSalon(salonId: string): Promise<Array<{ staffId: string; firstname: string; lastname: string; procedures: Procedure[] }>>;

    // 3) Kullanıcı bir randevu oluşturur; aynı randevuya birden fazla prosedür ekleyebilir
    bookAppointment(
        clientId: string,
        staffId: string,
        procedureIds: string[],
        appointmentDate: string | Date
    ): Promise<void>;

    // 4) Salon personeli, randevunun tamamlandığını işaretler
    completeAppointment(appointmentId: string, staffId: string): Promise<void>;

    // 5) Kullanıcı, randevu iptal talebi için salon personeline e-posta gönderir (sebep belirtir)
    requestAppointmentCancellationByUser(
        appointmentId: string,
        userId: string,
        reason: string
    ): Promise<void>;
}
