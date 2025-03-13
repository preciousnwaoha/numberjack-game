import { getPlayersApi, getRoomByIdApi } from "@/lib/contracts/api";
import { playerFromContractToPlayerType } from "@/lib/utils";

import {
  GameModeType,
  GameStatusType,
  PlayerType,
  RecentActivity,
  RoomType,
} from "@/types";
import type { Contract } from "ethers";
import { useEffect } from "react";

interface UseContractEventsProps {
  socketEmitter: (event: string, data?: any) => void;
  contract: Contract | undefined;
  setRoomData: React.Dispatch<React.SetStateAction<RoomType | null>>;
  setAvailableRooms: React.Dispatch<React.SetStateAction<RoomType[]>>;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerType[]>>;
  setRecentActivities: React.Dispatch<React.SetStateAction<RecentActivity[]>>;
  clientPlayerAddress: string;
  roomData: RoomType | null;
  availableRooms: RoomType[];
}

const useContractEvents = ({
  // socketEmitter,
  contract,
  setRoomData,
  setAvailableRooms,
  setPlayers,
  setRecentActivities,
  clientPlayerAddress,
  roomData,
  availableRooms,
}: UseContractEventsProps) => {
  // A separate effect for handling contract events.
  useEffect(() => {
    if (!contract) return;
    // Define contract event handlers
    const handleGameRoomCreated = (...args: unknown[]) => {
      const roomId = Number(args[0]).toString();
      const creatorAddress = (args[1] as string).toLowerCase() as string;
      const maxNumber = Number(args[2]);
      const entryFee = Number(args[3]);
      console.log("Game Room Created:", {
        roomId,
        creatorAddress,
        maxNumber,
        entryFee,
      });
      const newRoom = {
        creator: creatorAddress,
        name: "Some Room Name",
        id: roomId,
        players: [clientPlayerAddress],
        mode: "Rounds" as GameModeType,
        roundValue: 3, // TODO: Emit modevalue with mode
        roundCurrentValue: 1,
        maxNumber: maxNumber,
        isActive: true,
        status: "NotStarted" as GameStatusType,
        entryFee: entryFee,
        startTime: new Date().getTime(), // TODO: Emit start time
        duration: 0,
        currentPlayerIndex: 0,
        lastTurnTimestamp: 0,
        turnTimeout: 0,
      };
      if (clientPlayerAddress.toLowerCase() === creatorAddress) {
        setRoomData(newRoom);
        setRecentActivities((prev) => [
          ...prev,
          {
            type: "create",
            text: `Room created successfully!`,
            timestamp: new Date().getTime(),
          },
        ]);
      } else {
        setAvailableRooms((prev) => [...prev, newRoom]);
      }
    };

    const handlePlayerJoined = async (...args: unknown[]) => {
      const roomId = Number(args[0]).toString();
      const playerAddress = (args[1] as string).toLowerCase();
      if (
        (roomData && roomData.id === roomId) ||
        clientPlayerAddress.toLowerCase() === playerAddress
      ) {
        const { data: playersData } = await getPlayersApi({
          roomId: Number(roomId),
          contract,
        });
        if (!playersData) return;
        const newPlayers = playersData.map((player) =>
          playerFromContractToPlayerType({
            player,
          })
        );

        const { data } = await getRoomByIdApi({
          roomId: Number(roomId),
          contract,
        });
        if (!data) return;
        setPlayers(newPlayers);
        setRoomData(data);
        setRecentActivities((prev) => [
          ...prev,
          {
            type: "join",
            text: `${playerAddress} joined the room`,
            timestamp: new Date().getTime(),
          },
        ]);
      } else if (!roomData) {
        // client is not in any room
        const room = availableRooms.find((room) => room.id === roomId);
        if (room) {
          const updatedRoom = {
            ...room,
            players: [...room.players, playerAddress],
          };
          setAvailableRooms((prev) =>
            prev.map((r) => (r.id === roomId ? updatedRoom : r))
          );
        }
      }

      console.log("Event: Game Room Joined:", roomId, playerAddress);
    };

    // const handlePlayerLeft = (...args: unknown[]) => {
    //   // TOD0: Emit the player who left
    //   const roomId = Number(args[0]).toString();
    //   const playerAddress = args[1] as string;
    //   if (roomData?.id === roomId) {
    //     setPlayers((prev) => prev.filter((p) => p.address !== playerAddress));
    //     setRoomData((prev) =>
    //       prev
    //         ? {
    //             ...prev,
    //             players: roomData.players.filter((p) => p !== playerAddress),
    //           }
    //         : null
    //     );
    //     setRecentActivities((prev) => [
    //       ...prev,
    //       {
    //         type: "leave",
    //         text: `${playerAddress} left the room`,
    //         timestamp: new Date().getTime(),
    //       },
    //     ]);
    //   } else if (!roomData) {
    //     setAvailableRooms((prev) =>
    //       prev.map((room) =>
    //         room.id === roomId
    //           ? {
    //               ...room,
    //               players: room.players.filter((p) => p !== playerAddress),
    //             }
    //           : room
    //       )
    //     );
    //   }

    //   console.log("Event: Player Left:", args);
    // };

    const handleGameStarted = (...args: unknown[]) => {
      // TODO: Emit Time started
      const roomId = Number(args[0]).toString();
      if (roomData?.id === roomId) {
        const startTime = Date.now();
        setRoomData((prev) =>
          prev
            ? {
                ...prev,
                startTime,
                status: "InProgress",
              }
            : null
        );

        console.log("Event: Game Started:", args);
      }
    };

    const handleTurnPlayed = (...args: unknown[]) => {
      // TODO: Emit the Draws
      const roomId = Number(args[0]).toString();
      if (roomData?.id === roomId) {
        console.log("Event: Turn Played:", args);
      }
    };

    const handleTurnSkipped = (...args: unknown[]) => {
      const roomId = args[0];
      const playerAddress = (args[1] as string).toLowerCase();
      if (roomData?.id === roomId) {
        console.log("Turn Skipped:", args);
        setRecentActivities((prev) => [
          ...prev,
          {
            type: "skip",
            text: `${playerAddress} skipped their turn`,
            timestamp: new Date().getTime(),
          },
        ]);
      }
    };

    const handleTurnAdvanced = (...args: unknown[]) => {
      const roomId = args[0];
      const playerAddress = (args[1] as string).toLowerCase();
      if (roomData?.id === roomId) {
        setRoomData((prev) =>
          prev
            ? {
                ...prev,
                currentPlayerIndex: prev.players.findIndex(
                  (addr) => addr === playerAddress
                ),
              }
            : null
        );
        setRecentActivities((prev) => [
          ...prev,
          {
            type: "turn",
            text: `${playerAddress} advanced their turn`,
            timestamp: new Date().getTime(),
          },
        ]);
        console.log("Event: Turn Advanced:", args);
      }
    };

    const handlePlayerEliminated = (...args: unknown[]) => {
      // TODO: Why cant we get player {draws, totoal, address, isActive}
      const roomId = Number(args[0]).toString() as string;
      const playerAddress = (args[1] as string).toLowerCase();
      if (roomData?.id === roomId) {
        setPlayers((prev) =>
          prev.map((player) => {
            if (player.address === playerAddress) {
              return {
                ...player,
                isActive: false,
              };
            } else {
              return player;
            }
          })
        );
        setRecentActivities((prev) => [
          ...prev,
          {
            type: "bust",
            text: `${playerAddress} was eliminated`,
            timestamp: new Date().getTime(),
          },
        ]);
        console.log("Event: Player Eliminated:", args);
      }
    };

    const handleWinnerDeclared = (...args: unknown[]) => {
      // TODO: Why cant we get winner for a game
      const roomId = Number(args[0]).toString() as string;
      const winnerAddress = (args[1] as string).toLowerCase();
      if (roomData?.id === roomId) {
        setRoomData((prev) =>
          prev
            ? {
                ...prev,
                status: "Ended",
                winner: winnerAddress,
              }
            : null
        );
        setRecentActivities((prev) => [
          ...prev,
          {
            type: "winner",
            text: `${winnerAddress} won the game`,
            timestamp: new Date().getTime(),
          },
        ]);
        console.log("Event: Winner Declared:", args);
      }
    };

    const handleTurnTimeout = (...args: unknown[]) => {
      const roomId = Number(args[0]).toString() as string;
      // const playerAddress = (args[1] as string).toLowerCase();
      if (roomData?.id === roomId) {
        console.log("Event: Turn Timeout:", args);
      }
    };

    // Listen for events from the contract
    contract.on("GameRoomCreated", handleGameRoomCreated);
    contract.on("PlayerJoined", handlePlayerJoined);
    // TODO: contract.on("PlayerLeft", handlePlayerLeft);
    contract.on("GameStarted", handleGameStarted);
    contract.on("PlayerPlayed", handleTurnPlayed);
    contract.on("TurnSkipped", handleTurnSkipped);
    contract.on("TurnTimedOut", handleTurnTimeout);
    contract.on("TurnAdvanced", handleTurnAdvanced);
    contract.on("PlayerEliminated", handlePlayerEliminated);
    contract.on("WinnerDeclared", handleWinnerDeclared);

    return () => {
      if (contract) {
        contract.removeListener("GameRoomCreated", handleGameRoomCreated);
        contract.removeListener("PlayerJoined", handlePlayerJoined);
        // contract.removeListener("PlayerLeft", handlePlayerLeft);
        contract.removeListener("GameStarted", handleGameStarted);
        contract.removeListener("PlayerPlayed", handleTurnPlayed);
        contract.removeListener("TurnSkipped", handleTurnSkipped);
        contract.removeListener("TurnTimedOut", handleTurnTimeout);
        contract.removeListener("TurnAdvanced", handleTurnAdvanced);
        contract.removeListener("PlayerEliminated", handlePlayerEliminated);
        contract.removeListener("WinnerDeclared", handleWinnerDeclared);
      }
    };
  }, [contract]);
};

export default useContractEvents;
