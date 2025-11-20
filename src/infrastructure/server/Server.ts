import express, { Application } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { UserRoutes } from '../../interfaces/routes/UserRoutes';
import { SocketHandler } from '../../interfaces/sockets/SocketHandler';
import { errorHandlerMiddleware } from '../../interfaces/middlewares/ErrorHandlerMiddleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export class Server {
  private app: Application;
  private port: number;
  private httpServer: http.Server;
  private io: SocketIOServer;

  constructor(port: number, userRoutes: UserRoutes) {
    this.app = express();
    this.port = port;
    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer);

    this.configureMiddleware();
    this.app.use('/api/auth', userRoutes.router);

    // Initialize Socket.IO
    this.initializeSocketIO();

    // Use error handling middleware
    this.app.use(errorHandlerMiddleware);
  }

  private configureMiddleware() {
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended:true}));
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
