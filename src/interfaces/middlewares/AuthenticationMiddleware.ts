import {NextFunction, Response} from "express";
import {ExpressRequestInterface} from "../interface/ExpressRequestInterface";
import {UnAuthorizedError} from "../errors/UnAuthorizedError";
import {verifyAccessToken} from '../utils/jwtUtils';
import {db} from "../../config/DrizzleConfig";
import {usersTable} from "../../infrastructure/databases/drizzle/model/UserModel";
import {eq} from "drizzle-orm";
import {userPermissionsTable} from "../../infrastructure/databases/drizzle/model/UserPermissionModel";
import {permissionsTable} from "../../infrastructure/databases/drizzle/model/PermissionModel";


export const AuthenticationMiddleware = async (
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            next(new UnAuthorizedError("Access Denied. No token provided."));
            return;
        }
        const token = authHeader.split(" ")[1];
        const data = verifyAccessToken(token) as { userId: string; };

        // Kullanıcıyı ve izinlerini tek bir sorguda çek
        const userWithPermissions = await db
            .select({
                user: usersTable,
                permissionAction: permissionsTable.action,
            })
            .from(usersTable)
            .leftJoin(userPermissionsTable, eq(usersTable.id, userPermissionsTable.userId))
            .leftJoin(permissionsTable, eq(userPermissionsTable.permissionId, permissionsTable.id))
            .where(eq(usersTable.id, data.userId));

        if (!userWithPermissions || userWithPermissions.length === 0) {
            next(new UnAuthorizedError("Invalid Token."));
            return;
        }

        // Kullanıcı bilgilerini ve izin listesini req.user'a ata
        const user = userWithPermissions[0].user;
        const permissions = userWithPermissions
            .map(p => p.permissionAction)
            .filter((p): p is string => p !== null);

        req.user = {
            ...user,
            permissions: permissions,
        };

        next();
    } catch (err) {
        throw new UnAuthorizedError("Invalid Token.")
    }
};
