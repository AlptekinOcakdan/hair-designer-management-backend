export class RolePermission {
    constructor(
        public roleId: string,
        public permissionId: string,
        public createdAt: Date,
        public updatedAt: Date | null
    ) {}
}