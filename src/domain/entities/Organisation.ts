export class Organisation {
    constructor(
        public id: string,
        public name: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}