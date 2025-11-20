export class SalonStaff {
    constructor(
        public salonId: string,
        public userId: string,
        public roleId: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}