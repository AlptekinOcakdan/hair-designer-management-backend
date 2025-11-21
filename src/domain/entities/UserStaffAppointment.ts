export class UserStaffAppointment {
    constructor(
        public id: string,
        public clientId: string,
        public staffId: string,
        public procedureId: string,
        public appointmentDate: Date,
        public isComleted: boolean,
        public isCanceled: boolean,
        public cancellationReason: string | null,
        public cancelledBy: string | null,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}