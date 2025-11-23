import {IAuthUseCase} from "../../application/interface/IAuthUseCase";
import {Request, Response, NextFunction} from "express";
import logger from "../logger/Logger";
import {ExpressRequestInterface} from "../interface/ExpressRequestInterface";
import {Server} from "../../infrastructure/server/Server";

export class AuthController {
    constructor(
        private authUseCase:IAuthUseCase,
        private server: Server
    ) {}

    private setCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
    }

    async register(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const {
                firstname,
                lastname,
                email,
                password,
                TOSAccepted
            } = req.body;

            const result = await this.authUseCase.register(
                firstname,
                lastname,
                email,
                password,
                TOSAccepted
            );

            this.setCookie(res, result.refreshToken);

            res.status(201).json({
                user: result.user,
                accessToken: result.accessToken
            });
        }
        catch (e) {
            logger.error("Register method:\n",e);
            next(e);
        }
    }

    async login(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { email, password, rememberMe } = req.body;

            const result = await this.authUseCase.login(email, password, rememberMe);

            this.setCookie(res, result.refreshToken);

            res.status(200).json({
                user: result.user,
                accessToken: result.accessToken
            });
        }
        catch (e) {
            logger.error("Login method:\n",e);
            next(e);
        }
    }

    async logout(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;

            await this.authUseCase.logout(refreshToken);

            res.clearCookie('refreshToken');

            res.sendStatus(204);
        }
        catch (e) {
            logger.error("Logout method:\n",e);
            next(e);
        }
    }

    async refreshToken(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;

            const result = await this.authUseCase.refreshToken(refreshToken);

            res.status(200).json(result);
        }
        catch (e) {
            logger.error("Refresh Token method:\n",e);
            next(e);
        }
    }

    async forgotPassword(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { email } = req.body;

            await this.authUseCase.forgotPassword(email);

            res.sendStatus(204);
        }
        catch (e) {
            logger.error("Forgot Password method:\n",e);
            next(e);
        }
    }

    async resetPassword(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { token, newPassword } = req.body;

            await this.authUseCase.resetPassword(token, newPassword);

            res.sendStatus(204);
        }
        catch (e) {
            logger.error("Reset Password method:\n",e);
            next(e);
        }
    }

    async changePassword(req:ExpressRequestInterface, res:Response, next:NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { currentPassword, newPassword } = req.body;

            await this.authUseCase.changePassword(userId, currentPassword, newPassword);

            res.sendStatus(204);
        }
        catch (e) {
            logger.error("Change Password method:\n",e);
            next(e);
        }
    }

    async verifyEmail(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { token } = req.body;

            await this.authUseCase.confirmEmail(token);

            res.sendStatus(204);
        }
        catch (e) {
            logger.error("Verify Email method:\n",e);
            next(e);
        }
    }

    async verifyPhoneNumber(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { token } = req.body;

            await this.authUseCase.confirmPhoneNumber(token);

            res.sendStatus(204);
        }
        catch (e) {
            logger.error("Verify Phone Number method:\n",e);
            next(e);
        }
    }
}