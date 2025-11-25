export class UserRole {
    constructor(
        public id: number,
        public userId: string,
        public roleId: string,
        public organisationId: string | null,
        public salonId: string | null,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}