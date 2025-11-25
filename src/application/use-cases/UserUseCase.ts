import {IUserRepository} from "../../domain/repositories/IUserRepository";
import {User} from "../../domain/entities/User";
import {IUserUseCase} from "../interface/IUserUseCase";
import {ISalonStaffRepository} from "../../domain/repositories/ISalonStaffRepository";
import {IRoleRepository} from "../../domain/repositories/IRoleRepository";
import {ISalonRepository} from "../../domain/repositories/ISalonRepository";
import {SalonStaffBuilder} from "../builder/SalonStaffBuilder";
import {IUserStaffAppointmentRepository} from "../../domain/repositories/IUserStaffAppointmentRepository";
import {IMailService} from "../../domain/services/abstract/IMailService";
import {UserStaffAppointmentBuilder} from "../builder/UserStaffAppointmentBuilder";
import logger from "../../interfaces/logger/Logger";
import {UserBuilder} from "../builder/UserBuilder";
// Yeni import: staff-procedure repo + builder
import {IStaffProcedureRepository} from "../../domain/repositories/IStaffProcedureRepository";
import {StaffProcedureBuilder} from "../builder/StaffProcedureBuilder";
import {IProcedureRepository} from "../../domain/repositories/IProcedureRepository";
import {Procedure} from "../../domain/entities/Procedure";

export class UserUseCase implements IUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private salonStaffRepository: ISalonStaffRepository,
        private roleRepository: IRoleRepository,
        private salonRepository: ISalonRepository,
        private userStaffAppointmentRepository: IUserStaffAppointmentRepository,
        private mailService: IMailService,
        private staffProcedureRepository: IStaffProcedureRepository,
        private procedureRepository: IProcedureRepository
    ) {
    }

    // Yeni kullanıcı oluşturup salon-staff ilişkisi kurar
    async createAndAssignToSalon(
        userData: Partial<User>,
        salonId: string,
        roleId: string,
        staffOptions?: {
            availableForAppointments?: boolean;
            availableWeekDays?: string[];
            availableHours?: string[];
            nonAvailableRange?: string[];
        }
    ): Promise<User> {
        // 1) Salon ve rolün varlığını doğrula
        const salon = await this.salonRepository.findById(salonId);
        if (!salon) {
            throw new Error("Salon not found");
        }

        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        if (!userData.firstname || !userData.lastname || !userData.email) {
            throw new Error("Incomplete user data");
        }

        // 2) Kullanıcı oluştur
        const newUser = new UserBuilder()
            .setFirstname(userData.firstname)
            .setLastname(userData.lastname)
            .setEmail(userData.email)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build()

        const createdUser = await this.userRepository.create(newUser);

        // 3) SalonStaff kaydını oluştur
        const salonStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(createdUser.id) // repository tarafından atanan id beklentisi
            .setRoleId(roleId)
            .setAvalaibleForAppointments(!!staffOptions?.availableForAppointments)
            .setAvailableWeekDays(staffOptions?.availableWeekDays ?? [])
            .setAvailableHours(staffOptions?.availableHours ?? [])
            .setNonAvailableRange(staffOptions?.nonAvailableRange ?? [])
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        await this.salonStaffRepository.create(salonStaff);

        return createdUser;
    }

    // Var olan kullanıcıyı salon-staff tablosuna ekler
    async assignUserToSalon(
        userId: string,
        salonId: string,
        roleId: string,
        staffOptions?: {
            availableForAppointments?: boolean;
            availableWeekDays?: string[];
            availableHours?: string[];
            nonAvailableRange?: string[];
        }
    ): Promise<void> {
        // 1) Kullanıcı, salon ve rol kontrolleri
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const salon = await this.salonRepository.findById(salonId);
        if (!salon) {
            throw new Error("Salon not found");
        }

        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // 2) SalonStaff kaydını oluştur
        const salonStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
            .setRoleId(roleId)
            .setAvalaibleForAppointments(!!staffOptions?.availableForAppointments)
            .setAvailableWeekDays(staffOptions?.availableWeekDays ?? [])
            .setAvailableHours(staffOptions?.availableHours ?? [])
            .setNonAvailableRange(staffOptions?.nonAvailableRange ?? [])
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        await this.salonStaffRepository.create(salonStaff);
    }

    // Yeni metot: kullanıcının çalışacağı hafta günleri ve saatlerini ayarla
    async setWorkingSchedule(
        userId: string,
        salonId: string,
        availableWeekDays: string[],
        availableHours: string[]
    ): Promise<void> {
        const staff = await this.salonStaffRepository.findById(salonId, userId);
        if (!staff) throw new Error("SalonStaff relation not found");

        const updatedStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
            .setRoleId(staff.roleId)
            .setAvalaibleForAppointments(staff.avalaibleForAppointments)
            .setAvailableWeekDays(availableWeekDays)
            .setAvailableHours(availableHours)
            .setNonAvailableRange(staff.nonAvailableRange ?? [])
            .setCreatedAt(staff.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        await this.salonStaffRepository.update(updatedStaff);
    }

    // Yeni metot: availableForAppointments alanını değiştir
    async setAvailableForAppointments(
        userId: string,
        salonId: string,
        available: boolean
    ): Promise<void> {
        const staff = await this.salonStaffRepository.findById(salonId, userId);
        if (!staff) throw new Error("SalonStaff relation not found");

        const updatedStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
            .setRoleId(staff.roleId)
            .setAvalaibleForAppointments(available)
            .setAvailableWeekDays(staff.availableWeekDays ?? [])
            .setAvailableHours(staff.availableHours ?? [])
            .setNonAvailableRange(staff.nonAvailableRange ?? [])
            .setCreatedAt(staff.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        await this.salonStaffRepository.update(updatedStaff);
    }

    // Yeni metot: nonAvailableRange ekle, availableForAppointments = false yap, randevuları iptal et ve müşterilere mail at
    async setNonAvailableRange(
        userId: string,
        salonId: string,
        start: string | Date,
        end: string | Date,
        reason: string
    ): Promise<void> {
        const staff = await this.salonStaffRepository.findById(salonId, userId);
        if (!staff) throw new Error("SalonStaff relation not found");

        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Invalid start or end date");
        }
        if (endDate <= startDate) {
            throw new Error("End date must be after start date");
        }

        // 1) SalonStaff güncelle: availableForAppointments = false, nonAvailableRange append
        const newRange = `${startDate.toISOString()}|${endDate.toISOString()}`;
        const currentRanges = staff.nonAvailableRange ?? [];
        const updatedRanges = [...currentRanges, newRange];

        const updatedStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
            .setRoleId(staff.roleId)
            .setAvalaibleForAppointments(false)
            .setAvailableWeekDays(staff.availableWeekDays ?? [])
            .setAvailableHours(staff.availableHours ?? [])
            .setNonAvailableRange(updatedRanges)
            .setCreatedAt(staff.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        await this.salonStaffRepository.update(updatedStaff);

        // 2) İlgili staff için tüm randevuları çek, aralıkta olanları iptal et ve müşteriye mail gönder
        const allAppointments = await this.userStaffAppointmentRepository.findAll();
        const toCancel = allAppointments.filter(a => {
            if (a.staffId !== userId) return false;
            const apptDate = new Date(a.appointmentDate);
            return apptDate >= startDate && apptDate <= endDate && !a.isCanceled;
        });

        for (const appt of toCancel) {
            // Güncelleme: isCanceled, cancellationReason, cancelledBy, updatedAt
            const updatedAppt = new UserStaffAppointmentBuilder()
                .setId((appt as any).id)
                .setClientId(appt.clientId)
                .setStaffId(appt.staffId)
                .setProcedureId(appt.procedureIds)
                .setAppointmentDate(new Date(appt.appointmentDate))
                .setIsComleted(appt.isCompleted)
                .setIsCanceled(true)
                .setCancellationReason(reason)
                .setCancelledBy(userId)
                .setCreatedAt(appt.createdAt ?? new Date())
                .setUpdatedAt(new Date())
                .build();

            await this.userStaffAppointmentRepository.update(updatedAppt);

            // Müşteri emaili varsa bilgilendir
            const client = await this.userRepository.findById(appt.clientId);
            if (client && client.email) {
                try {
                    const subject = `Randevunuz iptal edildi: ${reason}`;
                    const body = `<p>Merhaba,</p><p>Maalesef ${new Date(appt.appointmentDate).toLocaleString()} tarihli randevunuz iptal edildi.</p><p>Neden: ${reason}</p>`;
                    await this.mailService.sendMail(client.email, subject, body);
                } catch (err) {
                    logger.error(err)
                }
            }
        }
    }

    // 1) Salon personeli bir kullanıcı için yapılan prosedürü kaydeder
    async staffAddPerformedProcedure(
        staffId: string,
        procedureId: string,
        durationMinutes: number,
        price: string
    ): Promise<void> {
        // basit doğrulamalar
        const staffUser = await this.userRepository.findById(staffId);
        if (!staffUser) throw new Error("Staff user not found");

        // prosedür kaydı oluştur
        const sp = new StaffProcedureBuilder()
            .setUserId(staffId)
            .setProcedureId(procedureId)
            .setDuration(durationMinutes)
            .setPrice(price)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        await this.staffProcedureRepository.create(sp);
    }

    // 2) Bir salondaki staff'ları ve onların yaptıkları prosedürleri getir
    async getStaffProceduresInSalon(salonId: string): Promise<Array<{ staffId: string; firstname: string; lastname: string; procedures: Procedure[] }>> {
        const allStaff = await this.salonStaffRepository.findAll();
        const staffInSalon = allStaff.filter(s => s.salonId === salonId);

        const allStaffProcedures = await this.staffProcedureRepository.findAll();

        // map her staff için Procedure entitylerini yükle
        return await Promise.all(staffInSalon.map(async s => {
            const user = await this.userRepository.findById(s.userId);
            const staffProcedures = allStaffProcedures.filter(sp => sp.userId === s.userId);

            const procedures = await Promise.all(
                staffProcedures.map(async sp => {
                    return await this.procedureRepository.findById(sp.procedureId); // proc olabilir null
                })
            );

            const filteredProcedures = procedures.filter((p): p is Procedure => p !== null);

            return {
                staffId: s.userId,
                firstname: user ? user.firstname ?? '' : '',
                lastname: user ? user.lastname ?? '' : '',
                procedures: filteredProcedures
            };
        }));
    }

    // 3) Randevu oluşturma (aynı randevuya birden fazla prosedür eklenebilir)
    async bookAppointment(
        clientId: string,
        staffId: string,
        procedureIds: string[],
        appointmentDate: string | Date
    ): Promise<void> {
        // doğrulamalar
        const client = await this.userRepository.findById(clientId);
        if (!client) throw new Error("Client not found");

        const staff = await this.userRepository.findById(staffId);
        if (!staff) throw new Error("Staff not found");

        const appointmentDateObj = appointmentDate instanceof Date ? appointmentDate : new Date(appointmentDate);
        if (isNaN(appointmentDateObj.getTime())) throw new Error("Invalid appointment date");

        const newAppointment = new UserStaffAppointmentBuilder()
            .setClientId(clientId)
            .setStaffId(staffId)
            .setProcedureId(procedureIds)
            .setAppointmentDate(appointmentDateObj)
            .setIsComleted(false)
            .setIsCanceled(false)
            .setCancellationReason(null)
            .setCancelledBy(null)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        await this.userStaffAppointmentRepository.create(newAppointment);
    }

    // 4) Salon personeli randevuyu tamamlandı olarak işaretler
    async completeAppointment(appointmentId: string, staffId: string): Promise<void> {
        const appt = await this.userStaffAppointmentRepository.findById(appointmentId);
        if (!appt) throw new Error("Appointment not found");
        if (appt.staffId !== staffId) throw new Error("Not authorized to complete this appointment");

        const updated = new UserStaffAppointmentBuilder()
            .setId(appt.id)
            .setClientId(appt.clientId)
            .setStaffId(appt.staffId)
            .setProcedureId(appt.procedureIds ?? appt.procedureIds ?? null)
            .setAppointmentDate(new Date(appt.appointmentDate))
            .setIsComleted(true)
            .setIsCanceled(appt.isCanceled ?? false)
            .setCancellationReason(appt.cancellationReason ?? null)
            .setCancelledBy(appt.cancelledBy ?? null)
            .setCreatedAt(appt.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        await this.userStaffAppointmentRepository.update(updated);
    }

    // 5) Kullanıcı, randevu iptal talebi için salon personeline e-posta gönderir (sebep belirtir)
    async requestAppointmentCancellationByUser(appointmentId: string, userId: string, reason: string): Promise<void> {
        const appt = await this.userStaffAppointmentRepository.findById(appointmentId);
        if (!appt) throw new Error("Appointment not found");
        if (appt.clientId !== userId) throw new Error("Not authorized to request cancellation for this appointment");

        const staffUser = await this.userRepository.findById(appt.staffId);
        if (!staffUser || !staffUser.email) throw new Error("Staff email not found");

        try {
            const subject = `İptal talebi: randevu ${new Date(appt.appointmentDate).toLocaleString()}`;
            const body = `<p>Merhaba ${ staffUser.firstname ?? '' },</p>
                          <p>Kullanıcı ${ (appt.clientId) } randevusunu iptal etmek istiyor.</p>
                          <p>Neden: ${reason}</p>
                          <p>Lütfen randevuyu kontrol edip kullanıcı ile iletişime geçiniz.</p>`;
            await this.mailService.sendMail(staffUser.email, subject, body);
        } catch (err) {
            logger.error("Error sending cancellation request email:", err);
        }
    }
}
