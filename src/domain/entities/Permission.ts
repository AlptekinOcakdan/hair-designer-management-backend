export class Permission {
    constructor(
        public id: string,
        public action: string,
        public description: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}