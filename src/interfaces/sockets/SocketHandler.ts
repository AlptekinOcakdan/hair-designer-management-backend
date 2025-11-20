import { Socket } from 'socket.io';

export class SocketHandler {
  static handleConnection(socket: Socket) {
    // Example event listener
    socket.on('message', (message: string) => {
      console.log(`Received message: ${message}`);
    });
  }
}
