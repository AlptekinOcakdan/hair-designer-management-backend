export class UserStaffAppointment {
    constructor(
        public id: string,
        public clientId: string,
        public staffId: string,
        public procedureId: string,
        public appointmentDate: Date,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}