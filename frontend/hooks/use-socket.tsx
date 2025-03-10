import { getNewPlayerDefault, getNextPlayerIndex } from "@/lib/utils";
import { socketService } from "@/services/socket";
import { PlayerType, RoomType } from "@/types";
import { useEffect } from "react";

interface useSocketProps {
  updatePlayers: (players: PlayerType[]) => void;
  updateRoomData: (room: RoomType | null) => void;
  updateAvailableRooms: (rooms: RoomType[]) => void;
  players: PlayerType[];
  roomData: RoomType | null;
  availableRooms: RoomType[];
}

const useSocket = ({
  updatePlayers,
  updateRoomData,
  updateAvailableRooms,
  players,
  roomData,
  availableRooms,
}: useSocketProps) => {
  useEffect(() => {
    // Connect the socket
    socketService.connect();
    socketService.on("connect", () => {
      console.log("✅ WebSocket connected to server");
    });
    // Socket event listeners
    socketService.on("roomCreated", (_room: RoomType) => {
      console.log("🚀 Game Created!", _room.id);
      if (!roomData) updateAvailableRooms([...availableRooms, _room]);
    });
    socketService.on(
      "playerJoined",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log("🏠 Player Joined Room:", roomId);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = [...players, getNewPlayerDefault(player)];
          updatePlayers(updatedPlayers);
          const updatedRoom = {
            ...roomData,
            players: [...roomData.players, player],
          };
          updateRoomData(updatedRoom);
        }
      }
    );
    socketService.on(
      "playerLeft",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log("🏠 Player Joined Room:", roomId);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = players.filter((p) => p.address !== player);
          updatePlayers(updatedPlayers);
          updateRoomData(
            roomData
              ? {
                  ...roomData,
                  players: roomData.players.filter((p) => p !== player),
                }
              : null
          );
        }
      }
    );
    socketService.on("gameStarted", () => {
      console.log("🚀 Game Started!");
      if (roomData) {
        const updatedRoom: RoomType = { ...roomData, status: "InProgress" };
        updateRoomData(updatedRoom);
      }
    });
    socketService.on(
      "playerDrew",
      (data: { roomId: string; player: string; draw: [number, number] }) => {
        const { roomId, player, draw } = data;
        console.log(`🎮 Player ${player} drew:`, draw);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = players.map((p) => {
            if (p.address === player) {
              return {
                ...p,
                draws: [...p.draws, ...draw],
                total: p.total + draw[0] + draw[1],
              };
            }
            return p;
          });
          updatePlayers(updatedPlayers);
          updateRoomData(
            roomData
              ? {
                  ...roomData,
                  currentPlayerIndex: getNextPlayerIndex(
                    players,
                    roomData.currentPlayerIndex
                  ),
                }
              : null
          );
        }
      }
    );
    socketService.on(
      "playerSkipped",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log(`🎮 Player ${player}`);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = players.map((p) => {
            if (p.address === player) {
              return {
                ...p,
                hasSkippedTurn: true,
              };
            }
            return p;
          });
          updatePlayers(updatedPlayers);
          updateRoomData(
            roomData
              ? {
                  ...roomData,
                  currentPlayerIndex: getNextPlayerIndex(
                    players,
                    roomData.currentPlayerIndex
                  ),
                }
              : null
          );
        }
      }
    );
    socketService.on(
      "playerOut",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log(`🎮 Player ${player}`);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = players.map((p) => {
            if (p.address === player) {
              return {
                ...p,
                isActive: false,
              };
            }
            return p;
          });
          updatePlayers(updatedPlayers);
        }
      }
    );
    socketService.on(
      "playerWon",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log(`🎮 Player ${player}`);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = players.map((p) => {
            if (p.address === player) {
              return {
                ...p,
                isActive: false,
              };
            }
            return p;
          });
          updatePlayers(updatedPlayers);
          updateRoomData(roomData ? { ...roomData, status: "Ended" } : null);
        }
      }
    );
    socketService.on(
      "playerClaimed",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log(`🎮 Player ${player} claimed`);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = players.map((p) => {
            if (p.address === player) {
              return {
                ...p,
                claimed: true,
              };
            }
            return p;
          });
          updatePlayers(updatedPlayers);
        }
      }
    );
    socketService.on("roomClosed", (roomId: string) => {
      console.log("🚀 Game Created!", roomId);
      const updatedRooms = availableRooms.filter(
        (room) => room.id !== Number(roomId)
      );
      if (roomData?.status === "NotStarted") updateAvailableRooms(updatedRooms);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    socketEmitter: socketService.emit,
  }
};
