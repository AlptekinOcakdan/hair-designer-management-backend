export class User {
    constructor(
        public id: string,
        public firstname: string,
        public lastname: string,
        public email: string,
        public phoneNumber: string,
        public emailVerified: boolean,
        public phoneVerified: boolean,
        public refreshToken: string,
        public TOSAccepted: boolean,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}