import { ISalonStaffRepository } from '../../../domain/repositories/ISalonStaffRepository';
import { SalonStaff } from '../../../domain/entities/SalonStaff';
import { SalonStaffDocument, SalonStaffInsert, salonStaffsTable } from "./model";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./model/SalonStaffModel";
import { eq, and } from "drizzle-orm"; // 'and' operatörünü ekledik

export class DrizzleSalonStaffRepository implements ISalonStaffRepository {
    private readonly table: typeof salonStaffsTable;

    constructor(
        private readonly db: NeonHttpDatabase<typeof schema>,
        table: typeof salonStaffsTable
    ) {
        this.table = table;
    }

    private toPersistence(s: SalonStaff): SalonStaffInsert {
        return {
            // 'id' alanı kaldırıldı, composite key kullanılıyor.
            salonId: s.salonId,
            userId: s.userId,
            roleId: s.roleId,
            avalaibleForAppointments: s.avalaibleForAppointments,
            availableWeekDays: s.availableWeekDays,
            availableHours: s.availableHours,
            nonAvailableRange: s.nonAvailableRange,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt ? s.updatedAt : undefined,
        };
    }

    private toDomain(doc: SalonStaffDocument): SalonStaff {
        return new SalonStaff(
            doc.salonId,
            doc.userId,
            doc.roleId,
            doc.avalaibleForAppointments,
            doc.availableWeekDays,
            doc.availableHours,
            doc.nonAvailableRange,
            doc.createdAt,
            doc.updatedAt ?? null
        );
    }

    async create(salonStaff: SalonStaff): Promise<SalonStaff> {
        const persistence = this.toPersistence(salonStaff);

        const [inserted] = await this.db
            .insert(this.table)
            .values(persistence)
            .returning();

        return this.toDomain(inserted);
    }

    // findById artık composite key (salonId, userId) istiyor
    async findById(salonId: string, userId: string): Promise<SalonStaff | null> {
        const [found] = await this.db
            .select()
            .from(this.table)
            .where(
                and(
                    eq(this.table.salonId, salonId),
                    eq(this.table.userId, userId)
                )
            );

        if (!found) return null;
        return this.toDomain(found);
    }

    async findAll(): Promise<SalonStaff[]> {
        const rows = await this.db.select().from(this.table);
        return rows.map(r => this.toDomain(r));
    }

    async update(salonStaff: SalonStaff): Promise<SalonStaff> {
        // Update işlemi için 'salonId' ve 'userId' entity üzerinden okunur
        const persistence = this.toPersistence(salonStaff);

        const [updated] = await this.db
            .update(this.table)
            .set(persistence)
            .where(
                and(
                    eq(this.table.salonId, salonStaff.salonId),
                    eq(this.table.userId, salonStaff.userId)
                )
            )
            .returning();

        if (!updated) {
            throw new Error("SalonStaff not found for update.");
        }

        return this.toDomain(updated);
    }

    // Delete işlemi de composite key istiyor
    async delete(salonId: string, userId: string): Promise<void> {
        await this.db
            .delete(this.table)
            .where(
                and(
                    eq(this.table.salonId, salonId),
                    eq(this.table.userId, userId)
                )
            );
    }
}