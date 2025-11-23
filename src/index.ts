import {Server} from './infrastructure/server/Server';
import {UserController} from './interfaces/controllers/UserController';
import {UserRoutes} from './interfaces/routes/UserRoutes';
import dotenv from 'dotenv';
import {UserUseCase} from './application/use-cases/userUseCase';
import {UserRepositoryFactory} from './application/factories/UserRepositoryFactory';
import logger from './interfaces/logger/Logger';
import {db} from "./config/DrizzleConfig";
import {usersTable} from "./infrastructure/databases/drizzle/model";
import {AuthUseCase} from "./application/use-cases/AuthUseCase";
import {BcryptService} from "./domain/services/concrete/BcryptService";
import {NodemailerService} from "./domain/services/concrete/NodemailerService";
import {AuthController} from "./interfaces/controllers/AuthController";
import {AuthRoutes} from "./interfaces/routes/AuthRoutes";
import {PORT} from "./interfaces/utils/constants";

dotenv.config();

const startApplication = async () => {
    const port = PORT ? parseInt(PORT) : 5001;

    // SERVICES
    const hashService = new BcryptService();
    const mailService = new NodemailerService();

    // REPOSITORIES
    const userRepository = UserRepositoryFactory.create(db, usersTable);

    // USE CASES
    const userUseCase = new UserUseCase(userRepository);
    const authUseCase = new AuthUseCase(userRepository, hashService, mailService);

    // CONTROLLERS
    const userController = new UserController(userUseCase, null as any);
    const authController = new AuthController(authUseCase, null as any);

    // ROUTES
    const userRoutes = new UserRoutes(userController);
    const authRoutes = new AuthRoutes(authController);

    const server = new Server(port, userRoutes, authRoutes);
    userController['server'] = server;  // Inject server after initialization
    authController['server'] = server;  // Inject server after initialization
    server.start();
};

startApplication().catch((error) => {
    logger.error('Error starting application:', error)
    process.exit(1);
});
