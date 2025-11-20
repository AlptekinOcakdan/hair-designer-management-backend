export class UserPermission {
    constructor(
        public userId: string,
        public permissionId: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}