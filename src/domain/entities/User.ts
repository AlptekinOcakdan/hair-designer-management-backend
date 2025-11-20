export class User {
    constructor(
        public id: string,
        public firstname: string,
        public lastname: string,
        public email: string,
        public password:string,
        public phoneNumber: string,
        public refreshToken: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}