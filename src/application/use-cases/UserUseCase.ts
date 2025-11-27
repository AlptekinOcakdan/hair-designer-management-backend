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
import {IUserRoleRepository} from "../../domain/repositories/IUserRoleRepository";
import {UserRoleBuilder} from "../builder/UserRoleBuilder";
import {IUserPermissionRepository} from "../../domain/repositories/IUserPermissionRepository";
import {IRolePermissionRepository} from "../../domain/repositories/IRolePermissionRepository";
import {UserPermissionBuilder} from "../builder/UserPermissionBuilder";
import {SalonStaff} from "../../domain/entities/SalonStaff";

export class UserUseCase implements IUserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private salonStaffRepository: ISalonStaffRepository,
        private roleRepository: IRoleRepository,
        private salonRepository: ISalonRepository,
        private userStaffAppointmentRepository: IUserStaffAppointmentRepository,
        private mailService: IMailService,
        private staffProcedureRepository: IStaffProcedureRepository,
        private procedureRepository: IProcedureRepository,
        private userRoleRepository: IUserRoleRepository,
        private userPermissionRepository: IUserPermissionRepository,
        private rolePermissionRepository: IRolePermissionRepository
    ) {
    }

    private async createNewAssignment(userId: string, salonId: string, roleId: string, orgId: string, options: any) {
        // 1. SalonStaff Kaydı
        const salonStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
            .setAvalaibleForAppointments(!!options?.availableForAppointments)
            .setAvailableWeekDays(options?.availableWeekDays ?? [])
            .setAvailableHours(options?.availableHours ?? [])
            .setNonAvailableRange(options?.nonAvailableRange ?? [])
            .setCreatedAt(new Date())
            .build();

        await this.salonStaffRepository.create(salonStaff);

        // 2. UserRole Kaydı
        await this.assignRole(userId, roleId, salonId, orgId);
    }

    private async assignRole(userId: string, roleId: string, salonId: string, orgId: string) {
        const userRole = new UserRoleBuilder()
            .setUserId(userId)
            .setRoleId(roleId)
            .setOrganisationId(orgId)
            .setSalonId(salonId)
            .setCreatedAt(new Date())
            .build();
        await this.userRoleRepository.create(userRole);
    }

    private async updateStaffOptions(userId: string, salonId: string, options: any) {
        // Düzeltme: Repository'de findByUserIdAndSalonId yok.
        // findById(salonId, userId) metodunu kullanıyoruz.
        const staff = await this.salonStaffRepository.findById(salonId, userId);

        if(staff && options) {
            const updatedStaff = new SalonStaffBuilder()
                .setSalonId(staff.salonId)
                .setUserId(staff.userId)
                // Mevcut değeri koru veya yenisiyle güncelle
                .setAvalaibleForAppointments(options.availableForAppointments !== undefined ? !!options.availableForAppointments : staff.avalaibleForAppointments)
                .setAvailableWeekDays(options.availableWeekDays ?? staff.availableWeekDays)
                .setAvailableHours(options.availableHours ?? staff.availableHours)
                .setNonAvailableRange(options.nonAvailableRange ?? staff.nonAvailableRange)
                .setCreatedAt(staff.createdAt ?? new Date())
                .setUpdatedAt(new Date())
                .build();

            await this.salonStaffRepository.update(updatedStaff);
        }
    }

    async assignRoleToUser(userId: string, roleId: string, organisationId: string| null, salonId: string | null): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        const userRole = new UserRoleBuilder()
            .setUserId(userId)
            .setRoleId(roleId)
            .setOrganisationId(organisationId)
            .setSalonId(salonId)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();
        await this.userRoleRepository.create(userRole);

        // Role ait yetkileri bul
        const rolePermissions = await this.rolePermissionRepository.findByRoleId(roleId);

        // Bu yetkileri kullanıcıya ata
        for (const rp of rolePermissions) {
            // Kullanıcının bu yetkiye zaten sahip olup olmadığını kontrol et
            const existingPermission = await this.userPermissionRepository.findById(userId, rp.permissionId);
            if (!existingPermission) {
                const userPermission = new UserPermissionBuilder()
                    .setUserId(userId)
                    .setPermissionId(rp.permissionId)
                    .setCreatedAt(new Date())
                    .setUpdatedAt(null)
                    .build();
                await this.userPermissionRepository.create(userPermission);
            }
        }
    }

    async createUser(userData: Partial<User>): Promise<User> {
        if (!userData.firstname || !userData.lastname || !userData.email) {
            throw new Error("Firstname, lastname, and email are required to create a user.");
        }

        const newUser = new UserBuilder()
            .setFirstname(userData.firstname)
            .setLastname(userData.lastname)
            .setEmail(userData.email)
            .setPhoneNumber(userData.phoneNumber ?? null)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        return await this.userRepository.create(newUser);
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

        const organisation = await this.salonRepository.findById(salonId);

        if (!organisation) {
            throw new Error("Organisation not found for the salon");
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
            .setAvalaibleForAppointments(!!staffOptions?.availableForAppointments)
            .setAvailableWeekDays(staffOptions?.availableWeekDays ?? [])
            .setAvailableHours(staffOptions?.availableHours ?? [])
            .setNonAvailableRange(staffOptions?.nonAvailableRange ?? [])
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        await this.salonStaffRepository.create(salonStaff);

        const userRole = new UserRoleBuilder()
            .setUserId(createdUser.id)
            .setRoleId(roleId)
            .setOrganisationId(organisation.organisationId)
            .setSalonId(salonId)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();
        await this.userRoleRepository.create(userRole);

        return createdUser;
    }

    // Var olan kullanıcıyı salon-staff tablosuna ekler
    async assignUserToSalon(
        userId: string,
        targetSalonId: string,
        targetRoleId: string,
        staffOptions?: {
            availableForAppointments?: boolean;
            availableWeekDays?: string[];
            availableHours?: string[];
            nonAvailableRange?: string[];
        }
    ): Promise<void> {
        // 1. Validasyonlar
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error("User not found");

        const targetSalon = await this.salonRepository.findById(targetSalonId);
        if (!targetSalon) throw new Error("Target salon not found");
        const organisationId = targetSalon.organisationId;

        const targetRole = await this.roleRepository.findById(targetRoleId);
        if (!targetRole) throw new Error("Target role not found");

        // 2. Mevcut Durumu Getir

        // DÜZELTME: Repository'de findByUserId yok.
        // Tüm staff kayıtlarını çekip JS tarafında filtreliyoruz.
        const allStaffRecords = await this.salonStaffRepository.findAll();
        const existingStaffRecords = allStaffRecords.filter(s => s.userId === userId);

        const existingRoles = await this.userRoleRepository.findByUserId(userId);

        // --- SALON STAFF İŞLEMLERİ ---
        // Kullanıcı salonStaff tablosunda bir salona dahilse...
        if (existingStaffRecords.length > 0) {
            let foundTargetSalon = false;

            for (const record of existingStaffRecords) {
                // Eğer mevcut kayıt hedef salon değilse, değiştir (Sil ve Yenisini Oluştur mantığı)
                if (record.salonId !== targetSalonId) {
                    await this.salonStaffRepository.delete(record.salonId, userId);
                } else {
                    // Kullanıcı zaten hedef salonda, varsa seçenekleri güncelle
                    foundTargetSalon = true;
                    if (staffOptions) {
                        await this.updateSalonStaffRecord(record, staffOptions);
                    }
                }
            }

            // Eğer hedef salon mevcut listede yoksa (hepsi silindiyse veya başta yoksa), oluştur
            if (!foundTargetSalon) {
                await this.createSalonStaffRecord(userId, targetSalonId, staffOptions);
            }
        } else {
            // Kullanıcı bir salona dahil değil, oluştur.
            await this.createSalonStaffRecord(userId, targetSalonId, staffOptions);
        }

        // --- USER ROLE İŞLEMLERİ ---
        // Kullanıcının rolü varsa...
        if (existingRoles.length > 0) {
            let foundTargetRole = false;

            for (const role of existingRoles) {
                // Rol targetRoleId ile aynı değilse (veya salon bağlamı uyuşmuyorsa) değiştir (Sil)
                if (role.roleId !== targetRoleId || role.salonId !== targetSalonId) {
                    await this.userRoleRepository.delete(userId, role.roleId);
                    // Not: Rol değiştiğinde eski role ait yetkileri (UserPermissions) temizlemek gerekebilir.
                } else {
                    foundTargetRole = true;
                }
            }

            // Eğer hedef rol bulunamadıysa (silindiyse veya hiç yoksa), oluştur ve yetkileri tanımla
            if (!foundTargetRole) {
                await this.createUserRoleRecord(userId, targetRoleId, organisationId, targetSalonId);
                await this.syncRolePermissions(userId, targetRoleId);
            }
        } else {
            // Kullanıcının rolü yok, oluştur ve yetkileri tanımla.
            await this.createUserRoleRecord(userId, targetRoleId, organisationId, targetSalonId);
            await this.syncRolePermissions(userId, targetRoleId);
        }
    }

    // --- Yardımcı Metotlar (Private Helpers) ---

    private async createSalonStaffRecord(userId: string, salonId: string, options: any) {
        const newStaff = new SalonStaffBuilder()
            .setUserId(userId)
            .setSalonId(salonId)
            .setAvalaibleForAppointments(!!options?.availableForAppointments)
            .setAvailableWeekDays(options?.availableWeekDays ?? [])
            .setAvailableHours(options?.availableHours ?? [])
            .setNonAvailableRange(options?.nonAvailableRange ?? [])
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();
        await this.salonStaffRepository.create(newStaff);
    }

    private async updateSalonStaffRecord(currentStaff: SalonStaff, options: any) {
        const updatedStaff = new SalonStaffBuilder()
            .setSalonId(currentStaff.salonId)
            .setUserId(currentStaff.userId)
            .setAvalaibleForAppointments(options.availableForAppointments !== undefined ? !!options.availableForAppointments : currentStaff.avalaibleForAppointments)
            .setAvailableWeekDays(options.availableWeekDays ?? currentStaff.availableWeekDays)
            .setAvailableHours(options.availableHours ?? currentStaff.availableHours)
            .setNonAvailableRange(options.nonAvailableRange ?? currentStaff.nonAvailableRange)
            .setCreatedAt(currentStaff.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        await this.salonStaffRepository.update(updatedStaff);
    }

    private async createUserRoleRecord(userId: string, roleId: string, orgId: string, salonId: string) {
        const userRole = new UserRoleBuilder()
            .setUserId(userId)
            .setRoleId(roleId)
            .setOrganisationId(orgId)
            .setSalonId(salonId)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();
        await this.userRoleRepository.create(userRole);
    }

    private async syncRolePermissions(userId: string, roleId: string) {
        const rolePermissions = await this.rolePermissionRepository.findByRoleId(roleId);
        for (const rp of rolePermissions) {
            const existingPermission = await this.userPermissionRepository.findById(userId, rp.permissionId);
            if (!existingPermission) {
                const userPermission = new UserPermissionBuilder()
                    .setUserId(userId)
                    .setPermissionId(rp.permissionId)
                    .setCreatedAt(new Date())
                    .setUpdatedAt(null)
                    .build();
                await this.userPermissionRepository.create(userPermission);
            }
        }
    }

    // Yeni metot: kullanıcının çalışacağı hafta günleri ve saatlerini ayarla
    async setWorkingSchedule(
        userId: string,
        salonId: string,
        availableWeekDays: string[],
        availableHours: string[]
    ): Promise<void> {
        // Düzeltme: findById(salonId, userId) parametre sırasına dikkat
        const staff = await this.salonStaffRepository.findById(salonId, userId);
        if (!staff) throw new Error("SalonStaff relation not found");

        const updatedStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
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
        // Düzeltme: findById(salonId, userId)
        const staff = await this.salonStaffRepository.findById(salonId, userId);
        if (!staff) throw new Error("SalonStaff relation not found");

        const updatedStaff = new SalonStaffBuilder()
            .setSalonId(salonId)
            .setUserId(userId)
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
        // Düzeltme: findById(salonId, userId)
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
    async getStaffProceduresInSalon(salonId: string): Promise<Array<{ staffId: string; firstname: string; lastname: string; procedures: any[] }>> {
        const allStaff = await this.salonStaffRepository.findAll();
        const staffInSalon = allStaff.filter(s => s.salonId === salonId);

        const allStaffProcedures = await this.staffProcedureRepository.findAll();

        // map her staff için Procedure entitylerini yükle
        return await Promise.all(staffInSalon.map(async s => {
            const user = await this.userRepository.findById(s.userId);
            const staffProcedures = allStaffProcedures.filter(sp => sp.userId === s.userId);

            const procedures = await Promise.all(
                staffProcedures.map(async sp => {
                    const proc = await this.procedureRepository.findById(sp.procedureId); // proc olabilir null
                    if (!proc) return null;
                    return {
                        id: proc.id,
                        name: proc.name,
                        createdAt: proc.createdAt,
                        updatedAt: proc.updatedAt,
                        duration: sp.duration,
                        price: sp.price
                    };
                })
            );

            const filteredProcedures = procedures.filter((p): p is NonNullable<typeof p> => p !== null);

            return {
                staffId: s.userId,
                firstname: user ? user.firstname ?? '' : '',
                lastname: user ? user.lastname ?? '' : '',
                procedures: filteredProcedures
            };
        }));
    }

    // --- YENİ EKLENEN METOT: Personelin boş vakitlerini hesaplar ---
    async getStaffAvailability(staffId: string, salonId: string, startDateStr: string, endDateStr: string): Promise<any[]> {
        const salonStaff = await this.salonStaffRepository.findById(salonId, staffId);
        if (!salonStaff) {
            throw new Error("Staff is not assigned to this salon.");
        }

        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date format.");
        }

        const result = [];
        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

        // Belirtilen tarih aralığında her gün için döngü
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const currentDayName = dayNames[d.getDay()];

            // 1. Çalışma Günü Kontrolü
            if (!salonStaff.availableWeekDays || !salonStaff.availableWeekDays.includes(currentDayName)) {
                result.push({ date: dateStr, isAvailable: false, reason: "Off day", slots: [] });
                continue;
            }

            // 2. Çalışma Saatleri Kontrolü
            // DÜZELTME: Veri tabanında ["09:00", "18:00"] gibi kayıtlıysa (dashboard hatası), bunu ["09:00-18:00"] formatına çevir
            let workingHoursRaw = salonStaff.availableHours || [];
            const workingHours: string[] = [];

            // Eğer saatlerin içinde '-' yoksa ve çift sayıdaysa (örn: Start, End, Start, End...)
            const hasHyphen = workingHoursRaw.some(h => typeof h === 'string' && h.includes('-'));
            if (!hasHyphen && workingHoursRaw.length > 0 && workingHoursRaw.length % 2 === 0) {
                for (let i = 0; i < workingHoursRaw.length; i += 2) {
                    workingHours.push(`${workingHoursRaw[i]}-${workingHoursRaw[i+1]}`);
                }
            } else {
                // Format düzgünse veya ayrıştırılamıyorsa, sadece string ve '-' içerenleri al
                workingHours.push(...workingHoursRaw.filter(h => typeof h === 'string' && h.includes('-')));
            }

            if (workingHours.length === 0) {
                result.push({ date: dateStr, isAvailable: false, reason: "No working hours defined", slots: [] });
                continue;
            }

            // 3. Meşguliyetleri (Appointments + NonAvailableRanges) Topla
            let busyIntervals: { start: number; end: number }[] = [];

            // a) Non-available ranges (İzinler, molalar)
            if (salonStaff.nonAvailableRange) {
                salonStaff.nonAvailableRange.forEach(range => {
                    if(!range) return; // Boş veri koruması
                    const [nsIso, neIso] = range.split('|');
                    const ns = new Date(nsIso);
                    const ne = new Date(neIso);

                    // Eğer izin aralığı bu günü kapsıyorsa
                    // Basitleştirme: Gün içindeki kesişimi alıyoruz.
                    // Günün başlangıcı ve bitişi
                    const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
                    const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999);

                    // Kesişim kontrolü
                    const overlapStart = ns < dayStart ? dayStart : ns;
                    const overlapEnd = ne > dayEnd ? dayEnd : ne;

                    if (overlapStart < overlapEnd) {
                        const startMin = overlapStart.getHours() * 60 + overlapStart.getMinutes();
                        const endMin = overlapEnd.getHours() * 60 + overlapEnd.getMinutes();
                        busyIntervals.push({ start: startMin, end: endMin });
                    }
                });
            }

            // b) Mevcut Randevular
            const allAppointments = await this.userStaffAppointmentRepository.findAll();
            const staffApps = allAppointments.filter(a => {
                const appDate = new Date(a.appointmentDate);
                // Sadece o günkü, iptal edilmemiş ve o personele ait randevular
                return a.staffId === staffId && !a.isCanceled && appDate.toDateString() === d.toDateString();
            });

            for (const app of staffApps) {
                const appDate = new Date(app.appointmentDate);
                const startMin = appDate.getHours() * 60 + appDate.getMinutes();

                // Randevu süresini prosedürlerden topla
                let totalDuration = 0;
                if (app.procedureIds) {
                    for (const pid of app.procedureIds) {
                        const sp = await this.staffProcedureRepository.findById(staffId, pid);
                        if (sp) totalDuration += sp.duration;
                    }
                }
                if (totalDuration === 0) totalDuration = 30; // Varsayılan güvenlik

                busyIntervals.push({ start: startMin, end: startMin + totalDuration });
            }

            // 4. Boş Aralıkları Hesapla
            const freeSlots = this.calculateFreeSlots(workingHours, busyIntervals);
            result.push({ date: dateStr, isAvailable: true, slots: freeSlots });
        }

        return result;
    }

    private calculateFreeSlots(workingHours: string[], busyIntervals: { start: number; end: number }[]): Array<{ start: string; end: string }> {
        const freeSlots: Array<{ start: string; end: string }> = [];

        // Meşguliyetleri başlangıç saatine göre sırala
        busyIntervals.sort((a, b) => a.start - b.start);

        for (const wh of workingHours) {
            // HATA DÜZELTME: wh değişkeninin string olup olmadığını kontrol et
            if (!wh || typeof wh !== 'string') continue;

            // wh: "09:00-17:00"
            const parts = wh.split('-');
            if (parts.length !== 2) continue; // Format hatalıysa atla

            const [startStr, endStr] = parts;
            const [sh, sm] = startStr.split(':').map(Number);
            const [eh, em] = endStr.split(':').map(Number);

            let currentBlockStart = sh * 60 + sm;
            const blockEnd = eh * 60 + em;

            for (const busy of busyIntervals) {
                // Eğer meşguliyet bloğumuzun tamamen dışındaysa (öncesindeyse) geç
                if (busy.end <= currentBlockStart) continue;

                // Eğer meşguliyet bloğumuzun tamamen sonrasındaysa döngüyü kır (bu çalışma saati bloğu için başka meşguliyet etkilemez)
                if (busy.start >= blockEnd) break;

                // Boşluk var mı?
                if (busy.start > currentBlockStart) {
                    freeSlots.push({
                        start: this.minutesToTime(currentBlockStart),
                        end: this.minutesToTime(busy.start)
                    });
                }

                // İmleci ilerlet
                currentBlockStart = Math.max(currentBlockStart, busy.end);
            }

            // Döngü bitti, hala sonda boşluk var mı?
            if (currentBlockStart < blockEnd) {
                freeSlots.push({
                    start: this.minutesToTime(currentBlockStart),
                    end: this.minutesToTime(blockEnd)
                });
            }
        }
        return freeSlots;
    }

    private minutesToTime(minutes: number): string {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    // --- GÜNCELLENMİŞ METOT: Randevu oluşturma ve Çakışma Kontrolü ---
    async bookAppointment(
        clientId: string,
        staffId: string,
        procedureIds: string[],
        appointmentDate: string | Date,
        salonId?: string // Opsiyonel parametre eklendi
    ): Promise<void> {
        const client = await this.userRepository.findById(clientId);
        if (!client) throw new Error("Client not found");

        const staff = await this.userRepository.findById(staffId);
        if (!staff) throw new Error("Staff not found");

        const appDateObj = new Date(appointmentDate);
        if (isNaN(appDateObj.getTime())) throw new Error("Invalid appointment date");

        // 1. Talep edilen randevunun toplam süresini hesapla
        let requestedDuration = 0;
        for (const pid of procedureIds) {
            const sp = await this.staffProcedureRepository.findById(staffId, pid);
            if (!sp) throw new Error(`Procedure ${pid} not found for this staff`);
            requestedDuration += sp.duration;
        }

        const reqStartMin = appDateObj.getHours() * 60 + appDateObj.getMinutes();
        const reqEndMin = reqStartMin + requestedDuration;

        // 2. Çakışma Kontrolü (Existing Appointments)
        const allAppointments = await this.userStaffAppointmentRepository.findAll();
        const sameDayApps = allAppointments.filter(a => {
            const d = new Date(a.appointmentDate);
            return a.staffId === staffId && !a.isCanceled && d.toDateString() === appDateObj.toDateString();
        });

        for (const app of sameDayApps) {
            const existDate = new Date(app.appointmentDate);
            const existStartMin = existDate.getHours() * 60 + existDate.getMinutes();

            let existDuration = 0;
            if (app.procedureIds) {
                for (const pid of app.procedureIds) {
                    const sp = await this.staffProcedureRepository.findById(staffId, pid);
                    if (sp) existDuration += sp.duration;
                }
            }
            if (existDuration === 0) existDuration = 30; // Fallback
            const existEndMin = existStartMin + existDuration;

            // Kesişim (Overlap) Formülü: Max(StartA, StartB) < Min(EndA, EndB)
            if (Math.max(reqStartMin, existStartMin) < Math.min(reqEndMin, existEndMin)) {
                throw new Error("Seçilen saatte personel dolu (Başka bir randevu ile çakışıyor).");
            }
        }

        // 3. (Opsiyonel) Salon Çalışma Saatleri ve İzin Kontrolü
        if (salonId) {
            const salonStaff = await this.salonStaffRepository.findById(salonId, staffId);
            if (salonStaff) {
                // a) Gün kontrolü
                const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                const dayName = dayNames[appDateObj.getDay()];
                if (!salonStaff.availableWeekDays?.includes(dayName)) {
                    throw new Error("Personel bu gün çalışmıyor.");
                }

                // b) Saat aralığı kontrolü (Basitçe: Randevu bir çalışma bloğunun içinde mi?)
                let fitsInSchedule = false;
                let workingHoursRaw = salonStaff.availableHours || [];

                // DÜZELTME: ["09:00", "18:00"] formatı için
                const workingHours: string[] = [];
                const hasHyphen = workingHoursRaw.some(h => typeof h === 'string' && h.includes('-'));
                if (!hasHyphen && workingHoursRaw.length > 0 && workingHoursRaw.length % 2 === 0) {
                    for (let i = 0; i < workingHoursRaw.length; i += 2) {
                        workingHours.push(`${workingHoursRaw[i]}-${workingHoursRaw[i+1]}`);
                    }
                } else {
                    workingHours.push(...workingHoursRaw.filter(h => typeof h === 'string' && h.includes('-')));
                }

                for (const wh of workingHours) {
                    if(!wh || typeof wh !== 'string') continue;

                    const [sStr, eStr] = wh.split('-');
                    if (!eStr) continue; // Format hatalıysa atla

                    const [sh, sm] = sStr.split(':').map(Number);
                    const [eh, em] = eStr.split(':').map(Number);
                    const blockStart = sh * 60 + sm;
                    const blockEnd = eh * 60 + em;

                    // Randevu tamamen bu bloğun içinde mi?
                    if (reqStartMin >= blockStart && reqEndMin <= blockEnd) {
                        fitsInSchedule = true;
                        break;
                    }
                }
                if (!fitsInSchedule && workingHours.length > 0) {
                    throw new Error("Randevu çalışma saatleri dışında.");
                }

                // c) Non-available ranges kontrolü
                if (salonStaff.nonAvailableRange) {
                    for (const range of salonStaff.nonAvailableRange) {
                        if (!range) continue;
                        const [ns, ne] = range.split('|').map(d => new Date(d));
                        // Randevu zamanı ile çakışıyor mu?
                        // (RandevuStart < RangeEnd) && (RangeStart < RandevuEnd)
                        const appEndObj = new Date(appDateObj.getTime() + requestedDuration * 60000);
                        if (appDateObj < ne && ns < appEndObj) {
                            throw new Error("Personel bu saatte izinli/müsait değil.");
                        }
                    }
                }
            }
        }

        const newAppointment = new UserStaffAppointmentBuilder()
            .setClientId(clientId)
            .setStaffId(staffId)
            .setProcedureId(procedureIds)
            .setAppointmentDate(appDateObj)
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

    // 6) Personelin randevularını getir (Opsiyonel tarih filtreli)
    async getStaffAppointments(staffId: string, date?: string | Date): Promise<any[]> {
        // Tüm randevuları çek (Repo'da özelleşmiş metod yoksa findAll + filter)
        const allAppointments = await this.userStaffAppointmentRepository.findAll();

        // Staff ID'ye göre filtrele
        let filteredAppointments = allAppointments.filter(appt => appt.staffId === staffId);

        // Tarih verilmişse güne göre filtrele
        if (date) {
            const targetDate = new Date(date);
            // Tarih geçerli mi kontrolü
            if (!isNaN(targetDate.getTime())) {
                filteredAppointments = filteredAppointments.filter(appt => {
                    const apptDate = new Date(appt.appointmentDate);
                    return (
                        apptDate.getFullYear() === targetDate.getFullYear() &&
                        apptDate.getMonth() === targetDate.getMonth() &&
                        apptDate.getDate() === targetDate.getDate()
                    );
                });
            }
        }

        // Müşteri detaylarını ekle
        return await Promise.all(filteredAppointments.map(async (appt) => {
            const client = await this.userRepository.findById(appt.clientId);

            return {
                ...appt,
                client: client ? {
                    id: client.id,
                    firstname: client.firstname,
                    lastname: client.lastname,
                    email: client.email,
                    phoneNumber: client.phoneNumber
                } : null
            };
        }));
    }

    async cancelAppointment(appointmentId: string, staffId: string, reason: string): Promise<void> {
        const appt = await this.userStaffAppointmentRepository.findById(appointmentId);
        if (!appt) throw new Error("Appointment not found");
        if (appt.staffId !== staffId) throw new Error("Not authorized to cancel this appointment");

        const updated = new UserStaffAppointmentBuilder()
            .setId(appt.id)
            .setClientId(appt.clientId)
            .setStaffId(appt.staffId)
            .setProcedureId(appt.procedureIds ?? null)
            .setAppointmentDate(new Date(appt.appointmentDate))
            .setIsComleted(appt.isCompleted)
            .setIsCanceled(true)
            .setCancellationReason(reason)
            .setCancelledBy(staffId)
            .setCreatedAt(appt.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        await this.userStaffAppointmentRepository.update(updated);

        // Müşteriyi bilgilendir
        const client = await this.userRepository.findById(appt.clientId);
        if (client && client.email) {
            try {
                const subject = `Randevunuz iptal edildi`;
                const body = `<p>Merhaba,</p><p>Maalesef ${new Date(appt.appointmentDate).toLocaleString()} tarihli randevunuz personel tarafından iptal edildi.</p><p>Neden: ${reason}</p>`;
                await this.mailService.sendMail(client.email, subject, body);
            } catch (err) {
                logger.error("Error sending cancellation email:", err);
            }
        }
    }

    async getStaffProcedures(staffId: string): Promise<any[]> {
        // Repo'da findByUserId yok, findAll + filter yapıyoruz
        const allStaffProcedures = await this.staffProcedureRepository.findAll();
        const myProcedures = allStaffProcedures.filter(sp => sp.userId === staffId);

        return await Promise.all(myProcedures.map(async (sp) => {
            const proc = await this.procedureRepository.findById(sp.procedureId);
            return {
                userId: sp.userId,
                procedureId: sp.procedureId,
                duration: sp.duration,
                price: sp.price,
                createdAt: sp.createdAt,
                updatedAt: sp.updatedAt,
                procedureName: proc ? proc.name : "Bilinmeyen Prosedür",
            };
        }));
    }

    async updateStaffProcedure(staffId: string, procedureId: string, duration: number, price: string): Promise<void> {
        const existing = await this.staffProcedureRepository.findById(staffId, procedureId);
        if (!existing) throw new Error("Staff procedure not found");

        const updated = new StaffProcedureBuilder()
            .setUserId(staffId)
            .setProcedureId(procedureId)
            .setDuration(duration)
            .setPrice(price)
            .setCreatedAt(existing.createdAt)
            .setUpdatedAt(new Date())
            .build();

        await this.staffProcedureRepository.update(updated);
    }

    async removeStaffProcedure(staffId: string, procedureId: string): Promise<void> {
        const existing = await this.staffProcedureRepository.findById(staffId, procedureId);
        if (!existing) throw new Error("Staff procedure not found");

        await this.staffProcedureRepository.delete(staffId, procedureId);
    }

    async getStaffSalons(userId: string): Promise<any[]> {
        // Repo'da findByUserId olmadığı için tümünü çekip filtreliyoruz (Performans için repo güncellenmeli)
        const allStaffRecords = await this.salonStaffRepository.findAll();
        const myRecords = allStaffRecords.filter(s => s.userId === userId);

        return await Promise.all(myRecords.map(async (record) => {
            const salon = await this.salonRepository.findById(record.salonId);
            return {
                salonId: record.salonId,
                userId: record.userId,
                avalaibleForAppointments: record.avalaibleForAppointments,
                availableWeekDays: record.availableWeekDays,
                availableHours: record.availableHours,
                nonAvailableRange: record.nonAvailableRange,
                salonName: salon ? salon.name : "Bilinmeyen Salon",
                salonLocation: salon ? salon.location : ""
            };
        }));
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async getUserById(userId: string): Promise<User> {
        const user =  await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
        const user =  await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const updatedUser = new UserBuilder()
            .setId(user.id!)
            .setFirstname(updateData.firstname ?? user.firstname)
            .setLastname(updateData.lastname ?? user.lastname)
            .setEmail(updateData.email ?? user.email)
            .setCreatedAt(user.createdAt ?? new Date())
            .setUpdatedAt(new Date())
            .build();

        return await this.userRepository.update(updatedUser);
    }

    async deleteUser(userId: string): Promise<void> {
        const user =  await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        await this.userRepository.delete(userId);
    }

    async getUsersByOrganisationId(organisationId: string): Promise<any[]> {
        // 1. Organizasyona ait tüm salonları bul
        const salonsInOrg = await this.salonRepository.findByOrganisationId(organisationId);
        if (!salonsInOrg || salonsInOrg.length === 0) {
            return []; // Bu organizasyonda salon yoksa boş dizi dön
        }
        const salonIds = salonsInOrg.map(s => s.id);
        const salonMap = new Map(salonsInOrg.map(s => [s.id, s]));

        // 2. Bu salonlarda çalışan tüm personeli bul
        const allSalonStaff = await this.salonStaffRepository.findAll();
        const staffInOrg = allSalonStaff.filter(staff => salonIds.includes(staff.salonId));
        const userIds = staffInOrg.map(s => s.userId);

        // 3. Personel kullanıcı bilgilerini ve rollerini tek seferde çek
        const allUsers = await this.userRepository.findAll();
        const userMap = new Map(allUsers.filter(u => userIds.includes(u.id)).map(u => [u.id, u]));

        const allUserRoles = await this.userRoleRepository.findAll();
        const userRolesMap = new Map<string, any[]>();
        userIds.forEach(userId => {
            const roles = allUserRoles.filter(ur => ur.userId === userId);
            userRolesMap.set(userId, roles);
        });

        const allRoles = await this.roleRepository.findAll();
        const roleMap = new Map(allRoles.map(r => [r.id, r]));

        // 4. Sonuçları birleştir
        return staffInOrg.map(staff => {
            const user = userMap.get(staff.userId);
            const salon = salonMap.get(staff.salonId);
            const userRoles = userRolesMap.get(staff.userId) || [];

            const roles = userRoles.map(ur => {
                const role = roleMap.get(ur.roleId);
                return {
                    id: role?.id,
                    name: role?.role
                };
            }).filter(r => r.id); // Rol bulunamadıysa ekleme

            return {
                user: {
                    id: user?.id,
                    firstname: user?.firstname,
                    lastname: user?.lastname,
                    email: user?.email,
                },
                salon: {
                    id: salon?.id,
                    name: salon?.name,
                },
                roles: roles,
            };
        });
    }
}