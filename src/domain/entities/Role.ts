export class Role {
    constructor(
        public id: string,
        public role: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}