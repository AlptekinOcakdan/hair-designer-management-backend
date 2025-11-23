import {Router} from "express";
import {AuthController} from "../controllers/AuthController";
import {AuthMiddleware} from "../middlewares/AuthMiddleware";

export class AuthRoutes {
    public router: Router;
    constructor(private authController: AuthController) {
        this.router = Router();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post("/register", this.authController.register.bind(this.authController));
        this.router.post("/login", this.authController.login.bind(this.authController));
        this.router.post("/logout", this.authController.logout.bind(this.authController));
        this.router.post("/refresh-token", this.authController.refreshToken.bind(this.authController));
        this.router.post("/forgot-password", this.authController.forgotPassword.bind(this.authController));
        this.router.post("/reset-password", this.authController.resetPassword.bind(this.authController));
        this.router.post("/change-password", AuthMiddleware, this.authController.changePassword.bind(this.authController));
        this.router.post("/verify-email", this.authController.verifyEmail.bind(this.authController));
        this.router.post("/verify-phone-number", this.authController.verifyPhoneNumber.bind(this.authController));
    }
}