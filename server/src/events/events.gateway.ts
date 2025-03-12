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
    if (!this.rooms[room.id]) {
      this.rooms[`${room.id}`] = { data: room, players: [] };
      client.join(`${room.id}`);
      console.log(
        `Room created: ${room.id} by ${client.id} - Players: ${room.players[0]}`,
      );
      // this.server.emit('roomCreated', this.rooms[room.id]);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { roomId: string; player: PlayerType }) {
    const { roomId, player } = data;
    if (this.rooms[roomId]) {
      this.rooms[roomId].players.push(player);
      client.join(roomId);
      console.log(`Player joined: ${player.address} to room ${roomId}`);
      // this.server.to(roomId).emit('playerJoined', data);
    }
  }

  @SubscribeMessage('leaveRoom')
  handlePlayerMove(
    client: Socket,
    data: { roomId: string; playerAddress: string },
  ) {
    const { roomId, playerAddress } = data;
    if (this.rooms[roomId]) {
      this.rooms[roomId].players = this.rooms[roomId].players.filter(
        (player) => player.address !== playerAddress,
      );
      client.leave(roomId);
      console.log(`Player left: ${playerAddress} from room ${roomId}`);
      this.server.to(data.roomId).emit('playerLeft', data);
    }
  }

  @SubscribeMessage('startGame')
  handleStartGame(client: Socket, data: { roomId: string; startTime: number }) {
    const { roomId, startTime } = data;
    if (this.rooms[roomId]) {
      this.rooms[roomId].data.startTime = startTime;
      this.rooms[roomId].data.status = 'InProgress';
      this.server.to(roomId).emit('gameStarted', data);
    }
  }

  @SubscribeMessage('advanceTurn')
  handleAdvanceTurn(
    client: Socket,
    data: { roomId: string; playerAddress: string; },
  ) {
    const { roomId, playerAddress } = data;
    if (this.rooms[roomId]) {
      const playerIndex = this.rooms[roomId].players.findIndex(
        (player) => player.address === playerAddress,
      );

      this.rooms[roomId].data.currentPlayerIndex = playerIndex
    }
    this.server.to(roomId).emit('turnAdvanced', data);
  }

  @SubscribeMessage('playerDraw')
  handlePlayerDraw(
    client: Socket,
    data: { roomId: string; playerAddress: string; draws: [number, number] },
  ) {
    const { roomId, playerAddress, draws } = data;
    if (this.rooms[roomId]) {
      this.rooms[roomId].players = this.rooms[roomId].players.map((player) => {
        if (player.address === playerAddress) {
          const newDraws = player.draws.concat(draws);
          const newTotal = player.total + draws[0] + draws[1];
          return { ...player, draws: newDraws, total: newTotal };
        }
        return player;
      });
    }
    this.server.to(roomId).emit('playerDrew', data);
  }

  @SubscribeMessage('playerSkip')
  handlePlayerSkip(
    client: Socket,
    data: { roomId: string; playerAddress: string },
  ) {
    const { roomId, playerAddress } = data;
    if (this.rooms[roomId]) {
      this.rooms[roomId].players = this.rooms[roomId].players.map((p) => {
        if (p.address === playerAddress) {
          return { ...p, hasSkippedTurn: true };
        }
        return p;
      });

      this.server.to(roomId).emit('playerSkipped', data);
    }
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
    if (this.rooms[data.roomId]) {
      delete this.rooms[data.roomId];
      this.server.to(data.roomId).emit('roomClosed', data);
      console.log(`Room closed: ${data.roomId}`);
    }
  }
}
