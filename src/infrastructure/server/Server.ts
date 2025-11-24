import express, {Application} from 'express';
import http from 'http';
import {Server as SocketIOServer, Socket} from 'socket.io';
import {UserRoutes} from '../../interfaces/routes/UserRoutes';
import {SocketHandler} from '../../interfaces/sockets/SocketHandler';
import {errorHandlerMiddleware} from '../../interfaces/middlewares/ErrorHandlerMiddleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {AuthRoutes} from "../../interfaces/routes/AuthRoutes";
import {API_PREFIX} from "../../interfaces/utils/constants";
import {OrganisationRoutes} from "../../interfaces/routes/OrganisationRoutes";
import {SalonRoutes} from "../../interfaces/routes/SalonRoutes";
import {ProcedureRoutes} from "../../interfaces/routes/ProcedureRoutes";
import {PermissionRoutes} from "../../interfaces/routes/PermissionRoutes";
import {RoleRoutes} from "../../interfaces/routes/RoleRoutes";
import {corsOptions} from "../../config/CORSConfig";
import {limiter} from "../../config/RateLimitConfig";
import {setupSwagger} from "../../config/SwaggerConfig";

export class Server {
    private readonly app: Application;
    private readonly port: number;
    private readonly httpServer: http.Server;
    private io: SocketIOServer;

    constructor(port: number, userRoutes: UserRoutes, authRoutes: AuthRoutes, organisationRoutes: OrganisationRoutes, salonRoutes: SalonRoutes, procedureRoutes: ProcedureRoutes, roleRoutes: RoleRoutes, permissionRoutes: PermissionRoutes) {
        this.app = express();
        this.port = port;
        this.httpServer = http.createServer(this.app);
        this.io = new SocketIOServer(this.httpServer);

        this.configureMiddleware();
        const routes = express.Router();

        routes.use('/auth', authRoutes.router);
        routes.use('/users', userRoutes.router);
        routes.use('/organisations', organisationRoutes.router);
        routes.use('/salons', salonRoutes.router);
        routes.use('/procedures', procedureRoutes.router);
        routes.use('/roles', roleRoutes.router);
        routes.use('/permissions', permissionRoutes.router);

        // Initialize Socket.IO
        this.initializeSocketIO();

        this.app.use(`${API_PREFIX}`, routes)


        // Use error handling middleware
        this.app.use(errorHandlerMiddleware);
        setupSwagger(this.app as express.Express);
    }

    private configureMiddleware() {
        this.app.use(cookieParser());
        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(limiter)
    }

    private initializeSocketIO() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Client connected: ${socket.id}`);

            // Handle socket events
            SocketHandler.handleConnection(socket);

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    start() {
        this.httpServer.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }

    // Method to emit events
    emitEvent(event: string, data: any) {
        this.io.emit(event, data);
    }
}
