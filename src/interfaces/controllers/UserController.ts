import {Request, Response, NextFunction} from "express";
import {Server} from "../../infrastructure/server/Server";
import {NotFoundError} from "../errors/NotFoundError";
import {IUserUseCase} from "../../application/interface/IUserUseCase";
import {ExpressRequestInterface} from "../interface/ExpressRequestInterface";
import {UnAuthorizedError} from "../errors/UnAuthorizedError";

export class UserController {
    constructor(private userUseCase: IUserUseCase, private server: Server) {
    }

    async createUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {username, email, password} = req.body;

            const {accessToken, refreshToken} = await this.userUseCase.createUser({
                username,
                email,
                password,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            //this.server.emitEvent("userCreated", { username, email });

            res.status(201).send({
                accessToken,
                refreshToken,
            });
        } catch (error) {
            next(error)
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email, password} = req.body;

            const {accessToken, refreshToken} = await this.userUseCase.loginUser(
                email,
                password
            );

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).send({
                accessToken,
                refreshToken,
            });
        } catch (error) {
            next(error)
        }
    }

    async refreshAccessToken(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {refreshToken} = req.body;
            const {accessToken} = await this.userUseCase.refreshAccessToken(
                refreshToken
            );

            res.status(200).json({accessToken});
        } catch (error) {
            next(error)
        }
    }

    async logout(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {refreshToken} = req.cookies || null;

            if (!refreshToken) {
                res.clearCookie("refreshToken");
                res.status(200).json({message: "logout successfully"});
            }

            const result = await this.userUseCase.logout(refreshToken);

            if (result) {
                res.clearCookie("refreshToken");
                res.status(200).json({message: "logout successfully"});
            } else {
                res.status(200).json({message: "logout successfully"});
            }
        } catch (error) {
            next(error)
        }
    }

    async getUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await this.userUseCase.getUser(req.params.id);

            if (!user) {
                next(new NotFoundError("User not found"));
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            next(error)
        }
    }

    async currentUser(
        req: ExpressRequestInterface,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                next(new UnAuthorizedError("Unauthorized Access"));
                return;
            }
            res.status(200).json({
                id: req.user.id,
                email: req.user.email,
                username: req.user.email,
            });
        } catch (error) {
            next(error)
        }
    }
}
