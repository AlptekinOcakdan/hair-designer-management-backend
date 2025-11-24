export class StaffProcedure {
    constructor(
        public userId: string,
        public procedureId: string,
        public duration: number, // Dakika cinsinden
        public price: string,    // Decimal veya kuruş cinsinden
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}