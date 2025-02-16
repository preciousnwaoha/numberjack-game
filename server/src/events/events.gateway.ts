import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
  import { from, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private rooms: Record<string, { players: string[] }> = {}; // Store rooms
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('createRoom')
    handleCreateRoom(client: Socket, room: { id: string; creator: string }) {
      if (!this.rooms[room.id]) {
        this.rooms[room.id] = { players: [room.creator] };
        client.join(room.id);
        console.log(`Room created: ${room.id}`);
        this.server.to(room.id).emit('roomUpdated', this.rooms[room.id]);
      }
    }
  
    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, roomId: string) {
      if (this.rooms[roomId]) {
        this.rooms[roomId].players.push(client.id);
        client.join(roomId);
        this.server.to(roomId).emit('roomUpdated', this.rooms[roomId]);
      }
    }
  
    @SubscribeMessage('startGame')
    handleStartGame(client: Socket, roomId: string) {
      this.server
        .to(roomId)
        .emit('gameStarted', { message: 'Game has started!' });
    }
  
    @SubscribeMessage('playerMove')
    handlePlayerMove(client: Socket, data: { roomId: string; move: any }) {
      this.server
        .to(data.roomId)
        .emit('playerMoved', { playerId: client.id, move: data.move });
    }
  }
  