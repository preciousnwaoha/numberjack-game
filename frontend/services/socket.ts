import { SERVER_URL } from "@/lib/constants";
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private SERVER_URL = SERVER_URL; // Ensure this matches your NestJS server

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(this.SERVER_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true, // If CORS is needed
      });

      this.socket.on("connect", () => {
        console.log("✅ WebSocket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.warn("❌ WebSocket disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("⚠️ WebSocket connection error:", error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log("🔌 WebSocket disconnected.");
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit "${event}" - WebSocket is not connected.`);
    }
  }
}

export const socketService = new SocketService();

/*


class SocketSingleton {
  private static instance: Socket | null = null;

  static getInstance(): Socket {
    if (!SocketSingleton.instance) {
      SocketSingleton.instance = io(SERVER_URL);
      SocketSingleton.setupEventHandlers();
    }
    return SocketSingleton.instance;
  }


  private static setupEventHandlers() {
    const socket = SocketSingleton.instance!;
    socket.on("connect", () => {});

    socket.on("disconnect", () => {});
  }

  static disconnect() {
    if (SocketSingleton.instance) {
      SocketSingleton.instance.disconnect();
      SocketSingleton.instance = null;
    }
  }
}

export default SocketSingleton;


*/