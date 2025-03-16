import { socketService } from "@/services/socket";
import { PlayerType, RoomType } from "@/types";
import { useEffect } from "react";

interface useSocketProps {
  setPlayers: React.Dispatch<React.SetStateAction<PlayerType[]>>;
  setRoomData: React.Dispatch<React.SetStateAction<RoomType | null>>;
  setAvailableRooms: React.Dispatch<React.SetStateAction<RoomType[]>>;
  players: PlayerType[];
  roomData: RoomType | null;
}

const useSocket = ({
  setPlayers,
  setRoomData,
  setAvailableRooms,
  roomData,
}: useSocketProps) => {
  useEffect(() => {
    // Connect the socket
    socketService.connect();
    socketService.on("connect", () => {
      console.log("✅ WebSocket connected to server");
    });
    // Socket event listeners
    socketService.on("roomCreated", (_room: RoomType) => {
      console.log("🚀 Scocket Game Created!", _room.id);
    });
    socketService.on(
      "playerJoined",
      (data: { roomId: string; player: string }) => {
        if (roomData?.id === data.roomId) {
          console.log("🏠 Scocket Player Joined Room:", data);
        }
      }
    );
    socketService.on(
      "playerLeft",
      (data: { roomId: string; playerAddress: string }) => {
        const { roomId, playerAddress } = data;
        if (roomData?.id === roomId) {
          console.log("🏠 Player Joined Room:", roomId);
          setPlayers((prev) => prev.filter((p) => p.address !== playerAddress));
          setRoomData((prev) =>
            prev
              ? {
                  ...prev,
                  players: roomData.players.filter((p) => p !== playerAddress),
                }
              : null
          );
        } else if (!roomData) {
          setAvailableRooms((prev) =>
            prev.map((room) =>
              room.id === roomId
                ? {
                    ...room,
                    players: room.players.filter((p) => p !== playerAddress),
                  }
                : room
            )
          );
        }
      }
    );
    socketService.on(
      "gameStarted",
      (data: { roomId: string; startTime: number }) => {
        const { roomId } = data;
        if (roomData && roomData.id === roomId) {
          console.log("🚀 Socket Game Started!", roomId);
        }
      }
    );
    socketService.on(
      "turnAdvanced",
      (data: { roomId: string; playerAddress: string }) => {
        const { roomId, playerAddress } = data;
        if (roomData?.id === roomId) {
          console.log(`🎮 Socket Player ${playerAddress} advanced turn`);
        }
      }
    );
    socketService.on(
      "playerDrew",
      (data: {
        roomId: string;
        playerAddress: string;
        draws: [number, number];
      }) => {
        const { roomId, playerAddress, draws } = data;
        if (roomData?.id === roomId) {
          console.log(`🎮 Socket Player ${playerAddress} drew:`, draws);
          setPlayers((prev) => {
            const updatedPlayers = prev.map((p) => {
              if (p.address === playerAddress) {
                return {
                  ...p,
                  draws: [...p.draws, ...draws],
                  total: p.total + draws[0] + draws[1],
                };
              }
              return p;
            });

            return updatedPlayers;
          });
        }
      }
    );
    socketService.on(
      "playerSkipped",
      (data: { roomId: string; playerAddress: string }) => {
        const { roomId, playerAddress } = data;
        if (roomData?.id === roomId) {
          console.log(`🎮 Scoket Player ${playerAddress} skipped turn`);
          setPlayers((prev) => {
            const updatedPlayers = prev.map((p) => {
              if (p.address === playerAddress) {
                return {
                  ...p,
                  hasSkippedTurn: true,
                };
              }
              return p;
            });

            return updatedPlayers;
          });
        }
      }
    );
    socketService.on(
      "playerOut",
      (data: { roomId: string; player: string }) => {
        if (roomData?.id === data.roomId) {
          console.log(`🎮 Socket Player ${data.player} lost`);
        }
      }
    );
    socketService.on(
      "playerWon",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        if (roomData?.id === roomId) {
          console.log(`🎮 Socket Player ${player} won`);
        }
      }
    );
    socketService.on(
      "playerClaimed",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;

        if (roomData?.id === roomId) {
          console.log(`🎮 Socket Player ${player} claimed`);
        }
      }
    );
    socketService.on("roomClosed", (roomId: string) => {
      if (roomData?.id === roomId) {
        console.log("🚀 Game Created!", roomId);
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    socketEmitter: socketService.emit,
  };
};

export default useSocket;
