import {NextFunction, Response} from "express";
import {ExpressRequestInterface} from "../interface/ExpressRequestInterface";
import {UnAuthorizedError} from "../errors/UnAuthorizedError";
import {verifyAccessToken} from '../utils/jwtUtils';
import {db} from "../../config/DrizzleConfig";
import {usersTable} from "../../infrastructure/databases/drizzle/model/UserModel";
import {eq} from "drizzle-orm";


export const AuthMiddleware = async (
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
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, data.userId)).limit(1);

        if (!user) {
            next(new UnAuthorizedError("Invalid Token."));
            return;
        }

        req.user = user;
        next();
    } catch (err) {
        throw new UnAuthorizedError("Invalid Token.")
    }
};
