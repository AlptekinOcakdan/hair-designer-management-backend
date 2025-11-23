import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateUserRegister } from '../middlewares/ValidationMiddleware';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class UserRoutes {
  public router: Router;

  constructor(private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register', validateUserRegister, this.userController.createUser.bind(this.userController));
    this.router.get('/user',AuthMiddleware, this.userController.currentUser.bind(this.userController));
  }
}
