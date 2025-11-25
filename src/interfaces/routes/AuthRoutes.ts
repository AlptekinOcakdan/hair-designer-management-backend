import {Router} from "express";
import {AuthController} from "../controllers/AuthController";
import {AuthenticationMiddleware} from "../middlewares/AuthenticationMiddleware";

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
        this.router.post("/verify-otp", this.authController.verifyToken.bind(this.authController));
        this.router.post("/refresh-token", this.authController.refreshToken.bind(this.authController));
        this.router.post("/verify-phone-number", this.authController.verifyPhoneNumber.bind(this.authController));
    }
}