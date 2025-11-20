export class Salon {
    constructor(
        public id: string,
        public location: string,
        public organisationId: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}