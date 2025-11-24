export class Organisation {
    constructor(
        public id: string,
        public name: string,
        public userId: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}