import {IAuthUseCase} from "../../application/interface/IAuthUseCase";
import {Request, Response, NextFunction} from "express";
import logger from "../logger/Logger";
import {ExpressRequestInterface} from "../interface/ExpressRequestInterface";
import {Server} from "../../infrastructure/server/Server";

export class AuthController {
    constructor(
        private authUseCase:IAuthUseCase,
        private server: Server
    ) {
        void this.server;
    }

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
                TOSAccepted
            } = req.body;

            const result = await this.authUseCase.register(
                firstname,
                lastname,
                email,
                TOSAccepted
            );

            res.status(201).json({
                user: result.user,
            });
        }
        catch (e) {
            logger.error("Register method:\n",e);
            next(e);
        }
    }

    async login(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { email, rememberMe } = req.body;

            const result = await this.authUseCase.login(email);

            res.status(200).json({
                user: result.user,
            });
        }
        catch (e) {
            logger.error("Login method:\n",e);
            next(e);
        }
    }

    async verifyToken(req:Request, res:Response, next:NextFunction): Promise<void> {
        try {
            const { email, otpCode, rememberMe } = req.body;

            const result = await this.authUseCase.verifyOTP(email, otpCode, rememberMe);

            this.setCookie(res, result.refreshToken);

            res.status(200).json({
                user: result.user,
                accessToken: result.accessToken
            });
        }
        catch (e) {
            logger.error("Verify Token method:\n",e);
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