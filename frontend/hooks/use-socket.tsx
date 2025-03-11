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
        console.log("🏠 Scocket Player Joined Room:", data);
      }
    );
    socketService.on(
      "playerLeft",
      (data: { roomId: string; playerAddress: string }) => {
        const { roomId, playerAddress } = data;
        console.log("🏠 Player Joined Room:", roomId);
        if (roomData?.id === roomId) {
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
    socketService.on("gameStarted", (data: { roomId: string; startTime: number }) => {
      const { roomId } = data;
      console.log("🚀 Socket Game Started!", roomId);
      if (roomData) {
        setRoomData((prev) =>
          prev
            ? {
                ...prev,
                startTime: data.startTime,
                status: "InProgress",
              }
            : null
        );
      }
    });
    socketService.on(
      "turnAdvanced",
      (data: { roomId: string; playerAddress: string}) => {
        const { roomId, playerAddress } = data;
        console.log(`🎮 Socket Player ${playerAddress} advanced turn`);
        if (roomData?.id === roomId) {
          setRoomData((prev) =>
            prev
              ? {
                  ...prev,
                  currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
                }
              : null
          );
        }
      }
    );
    socketService.on(
      "playerDrew",
      (data: { roomId: string; playerAddress: string; draws: [number, number] }) => {
        const { roomId, playerAddress, draws } = data;
        console.log(`🎮 Socket Player ${playerAddress} drew:`, draws);
        if (roomData?.id === roomId) {
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
        console.log(`🎮 Scoket Player ${playerAddress}`);
        if (roomData?.id === roomId) {
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
        const { roomId, player } = data;
        console.log(`🎮 Socket Player ${player}`);
        if (roomData?.id === roomId) {
          setPlayers((prev) => {
            const updatedPlayers = prev.map((p) => {
              if (p.address === player) {
                return {
                  ...p,
                  isActive: false,
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
      "playerWon",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log(`🎮 Socket Player ${player}`);
        if (roomData?.id === roomId) {
          setPlayers((prev) => {
            const updatedPlayers = prev.map((p) => {
              if (p.address === player) {
                return {
                  ...p,
                  isActive: false,
                };
              }
              return p;
            });

            return updatedPlayers;
          });
          setRoomData((prev) => (prev ? { ...prev, status: "Ended" } : null));
        }
      }
    );
    socketService.on(
      "playerClaimed",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log(`🎮 Socket Player ${player} claimed`);
        if (roomData?.id === roomId) {
          setPlayers((prev) => {
            const updatedPlayers = prev.map((p) => {
              if (p.address === player) {
                return {
                  ...p,
                  claimed: true,
                };
              }
              return p;
            });

            return updatedPlayers;
          });
        }
      }
    );
    socketService.on("roomClosed", (roomId: string) => {
      console.log("🚀 Game Created!", roomId);

      if (roomData?.status === "NotStarted")
        setAvailableRooms((prev) =>
          prev.filter((room) => room.id !== roomId)
        );
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
