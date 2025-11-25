import { IOrganisationUseCase } from "../interface/IOrganisationUseCase";
import { IOrganisationRepository } from "../../domain/repositories/IOrganisationRepository";
import { Organisation } from "../../domain/entities/Organisation";
import { OrganisationBuilder } from "../builder/OrganisationBuilder";

// Yeni importlar
import { ISalonRepository } from "../../domain/repositories/ISalonRepository";
import { ISalonStaffRepository } from "../../domain/repositories/ISalonStaffRepository";
import { IUserStaffAppointmentRepository } from "../../domain/repositories/IUserStaffAppointmentRepository";
import { IStaffProcedureRepository } from "../../domain/repositories/IStaffProcedureRepository";

export class OrganisationUseCase implements IOrganisationUseCase {
    constructor(
        private readonly organisationRepository: IOrganisationRepository,
        private readonly salonRepository: ISalonRepository,
        private readonly salonStaffRepository: ISalonStaffRepository,
        private readonly userStaffAppointmentRepository: IUserStaffAppointmentRepository,
        private readonly staffProcedureRepository: IStaffProcedureRepository
    ) {}

    async create(userId: string, name: string): Promise<Organisation> {
        const organisation = new OrganisationBuilder()
            .setUserId(userId)
            .setName(name)
            .setCreatedAt(new Date())
            .setUpdatedAt(null)
            .build();

        return this.organisationRepository.create(organisation);
    }

    async update(organisation: Organisation): Promise<Organisation> {
        // güncelleme zamanı setlenir
        organisation.updatedAt = new Date();
        return this.organisationRepository.update(organisation);
    }

    async getAll(): Promise<Organisation[]> {
        return this.organisationRepository.findAll();
    }

    async getMyOrganisations(userId: string): Promise<Organisation[]> {
        return this.organisationRepository.findByUserId(userId);
    }

    async getById(id: string): Promise<Organisation | null> {
        return this.organisationRepository.findById(id);
    }

    async delete(id: string): Promise<void> {
        await this.organisationRepository.delete(id);
    }

    async getEarnings(
        organisationId: string,
        options?: { month?: string; year?: string; salonIds?: string[] }
    ): Promise<Array<{ salonId: string; salonName: string; total: string }>> {
        // 1. Tarih Aralığını Belirle (Yıl desteği eklendi)
        const { startDate, endDate } = this.calculateDateRange(options);

        // 2. Organizasyona ait salonları çek
        const allSalons = await this.salonRepository.findByOrganisationId(organisationId);

        // Filtreleme varsa uygula
        const targetSalons = (options?.salonIds && options.salonIds.length > 0)
            ? allSalons.filter(s => options.salonIds!.includes(s.id))
            : allSalons;

        if (targetSalons.length === 0) return [];

        // 3. Verileri Çek (Staff, Appointments, Procedures)
        const [allStaff, allAppointments, allProcedures] = await Promise.all([
            this.salonStaffRepository.findAll(),
            this.userStaffAppointmentRepository.findAll(),
            this.staffProcedureRepository.findAll()
        ]);

        // 4. Fiyat Haritası (Lookup Map) Oluştur
        const priceMap = new Map<string, number>();
        for (const proc of allProcedures) {
            const key = `${proc.userId}:${proc.procedureId}`;
            const price = parseFloat(proc.price);
            if (!isNaN(price)) {
                priceMap.set(key, price);
            }
        }

        const results: Array<{ salonId: string; salonName: string; total: string }> = [];

        // 5. Her Salon İçin Hesapla
        for (const salon of targetSalons) {
            // Bu salonda çalışan personeli bul
            const salonStaffIds = allStaff
                .filter(staff => staff.salonId === salon.id)
                .map(staff => staff.userId);

            if (salonStaffIds.length === 0) {
                results.push({ salonId: salon.id, salonName: salon.name, total: "0.00" });
                continue;
            }

            // Randevuları filtrele (Tarih ve Personel kontrolü)
            const validAppointments = allAppointments.filter(appt => {
                const apptDate = new Date(appt.appointmentDate);

                if (appt.isCanceled) return false;

                // Tarih kontrolü (Yıl seçildiyse tüm yılı kapsar)
                if (apptDate < startDate || apptDate > endDate) return false;

                return salonStaffIds.includes(appt.staffId);
            });

            // Toplam tutarı hesapla
            let salonTotal = 0;
            for (const appt of validAppointments) {
                if (!appt.procedureIds || appt.procedureIds.length === 0) continue;

                for (const procId of appt.procedureIds) {
                    const key = `${appt.staffId}:${procId}`;
                    const price = priceMap.get(key) || 0;
                    salonTotal += price;
                }
            }

            results.push({
                salonId: salon.id,
                salonName: salon.name,
                total: salonTotal.toFixed(2)
            });
        }

        return results;
    }

    /**
     * Helper: Tarih aralığını hesaplar (Ay veya Yıl bazlı)
     */
    private calculateDateRange(options?: { month?: string; year?: string }): { startDate: Date; endDate: Date } {
        let startDate: Date;
        let endDate: Date;

        if (options?.month) {
            // Durum 1: Belirli bir Ay ("2024-05")
            const [yearStr, monthPart] = options.month.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthPart, 10);

            if (isNaN(year) || isNaN(month)) {
                throw new Error('Invalid month format. Expected YYYY-MM');
            }

            startDate = new Date(year, month - 1, 1, 0, 0, 0);
            endDate = new Date(year, month, 0, 23, 59, 59); // Ayın son günü
        }
        else if (options?.year) {
            // Durum 2: Belirli bir Yıl ("2024")
            const year = parseInt(options.year, 10);

            if (isNaN(year)) {
                throw new Error('Invalid year format. Expected YYYY');
            }

            // Yılın başı: 1 Ocak 00:00
            startDate = new Date(year, 0, 1, 0, 0, 0);
            // Yılın sonu: 31 Aralık 23:59:59
            endDate = new Date(year, 11, 31, 23, 59, 59);
        }
        else {
            // Durum 3: Varsayılan (Son 30 gün)
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
        }

        return { startDate, endDate };
    }
}
