import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomType } from 'src/types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Record<string, RoomType> = {}; // Store rooms

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, room: RoomType) {
    if (!this.rooms[room.id]) {
      this.rooms[`${room.id}`] = room;
      client.join(`${room.id}`);
      console.log(
        `Room created: ${room.id} by ${client.id} - Players: ${room.players[0]}`,
      );
      this.server.emit('roomCreated', this.rooms[room.id]);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { roomId: string; player: string }) {
    const { roomId, player } = data;
    if (this.rooms[roomId]) {
      this.rooms[roomId].players.push(player);
      client.join(roomId);
      this.server.to(roomId).emit('playerJoined', data);
    }
  }

  @SubscribeMessage('leaveRoom')
  handlePlayerMove(client: Socket, data: { roomId: string; player: string }) {
    this.server.to(data.roomId).emit('playerLeft', data);
  }

  @SubscribeMessage('startGame')
  handleStartGame(client: Socket, roomId: string) {
    this.server.to(roomId).emit('gameStarted', roomId);
  }

  @SubscribeMessage('playerDraw')
  handlePlayerDraw(
    client: Socket,
    data: { roomId: string; player: string; draw: [number, number] },
  ) {
    this.server.to(data.roomId).emit('playerDrew', data);
  }

  @SubscribeMessage('playerSkip')
  handlePlayerSkip(client: Socket, data: { roomId: string; player: string }) {
    this.server.to(data.roomId).emit('playerSkipped', data);
  }

  @SubscribeMessage('playerLost')
  handlePlayerLost(client: Socket, data: { roomId: string; player: string }) {
    this.server.to(data.roomId).emit('playerOut', data);
  }

  @SubscribeMessage('playerWin')
  handlePlayerWin(client: Socket, data: { roomId: string; player: string }) {
    this.server.to(data.roomId).emit('playerWon', data);
  }

  @SubscribeMessage('playerClaim')
  handlePlayerClaim(client: Socket, data: { roomId: string; player: string }) {
    this.server.to(data.roomId).emit('playerClaimed', data);
  }

  @SubscribeMessage('closeRoom')
  handleCloseRoom(client: Socket, data: { roomId: string }) {
    const updattedRooms = Object.keys(this.rooms).reduce(
      (acc, key) => {
        if (key !== data.roomId) {
          acc[key] = this.rooms[key];
        }
        return acc;
      },
      {} as Record<string, RoomType>,
    );
    this.rooms = updattedRooms;
  }
}
