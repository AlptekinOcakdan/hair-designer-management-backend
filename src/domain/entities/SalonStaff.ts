export class SalonStaff {
    constructor(
        public salonId: string,
        public userId: string,
        public avalaibleForAppointments: boolean,
        public availableWeekDays: string[],
        public availableHours: string[],
        public nonAvailableRange: string[],
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}