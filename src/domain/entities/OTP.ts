export class OTP {
    constructor(
        public id: string,
        public code: string,
        public userId: string,
        public expiresAt: Date,
        public isValidated: boolean,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}
