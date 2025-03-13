import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlayerType, RoomType } from 'src/types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Record<
    string,
    {
      data: RoomType;
      players: PlayerType[];
    }
  > = {}; // Store rooms

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, room: RoomType) {
    this.server.emit('roomCreated', this.rooms[room.id]);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { room: RoomType; player: PlayerType }) {
    this.server.emit('playerJoined', data);
  }

  @SubscribeMessage('leaveRoom')
  handlePlayerMove(
    client: Socket,
    data: { roomId: string; playerAddress: string },
  ) {
    this.server.emit('playerLeft', data);
  }

  @SubscribeMessage('startGame')
  handleStartGame(client: Socket, data: { roomId: string; startTime: number }) {
    this.server.emit('gameStarted', data);
  }

  @SubscribeMessage('advanceTurn')
  handleAdvanceTurn(
    client: Socket,
    data: { roomId: string; playerAddress: string },
  ) {
    this.server.emit('turnAdvanced', data);
  }

  @SubscribeMessage('playerDraw')
  handlePlayerDraw(
    client: Socket,
    data: { roomId: string; playerAddress: string; draws: [number, number] },
  ) {
    this.server.emit('playerDrew', data);
  }

  @SubscribeMessage('playerSkip')
  handlePlayerSkip(
    client: Socket,
    data: { roomId: string; playerAddress: string },
  ) {
    this.server.emit('playerSkipped', data);
  }

  @SubscribeMessage('playerLost')
  handlePlayerLost(client: Socket, data: { roomId: string; player: string }) {
    this.server.emit('playerOut', data);
  }

  @SubscribeMessage('playerWin')
  handlePlayerWin(client: Socket, data: { roomId: string; player: string }) {
    this.server.emit('playerWon', data);
  }

  @SubscribeMessage('playerClaim')
  handlePlayerClaim(client: Socket, data: { roomId: string; player: string }) {
    this.server.emit('playerClaimed', data);
  }

  @SubscribeMessage('closeRoom')
  handleCloseRoom(client: Socket, data: { roomId: string }) {
    this.server.emit('roomClosed', data);
  }
}
