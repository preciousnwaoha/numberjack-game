"use client";

import { DUMMY_PLAYERS, DUMMY_ROOM } from "@/lib/constants";
import { genRandomColor } from "@/lib/gameUtils";
import { socketService } from "@/services/socket";
import { PlayerType, RoomType } from "@/types";
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  SetStateAction,
} from "react";

interface GameContextType {
  clientPlayerAddress: string;
  availableRooms: RoomType[];
  roomData: RoomType | null;
  players: PlayerType[];
  currentPlayer: number;
  gameRound: number;
  scores: number[];

  createRoom: (room: RoomType) => void;

  joinRoom: (roomId: string) => void;

  startGame: () => void;

  drawCard: () => void;

  skipTurn: () => void;

  isGameOver: boolean;

  winner: number | null;

  error: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clientPlayerAddress, setClientPlayerAddress] = useState("0x123");
  const [roomData, setRoomData] = useState<RoomType | null>(DUMMY_ROOM);
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>(DUMMY_PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameRound, setGameRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socketService.connect(); // Initialize WebSocket connection

    socketService.on("connect", () => {
      console.log("✅ WebSocket connected to server");
    });

    socketService.on("roomUpdated", (room) => {
      console.log("🏠 Room Updated:", room);
      setRoomData(room);
    });

    socketService.on("gameStarted", () => {
      console.log("🚀 Game Started!");
    });

    socketService.on("playerMoved", (data) => {
      console.log(`🎮 Player ${data.playerId} moved:`, data.move);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const createRoom = (newRoom: RoomType) => {
    // create room on chain
    setPlayers([
      {
        name: "Some name",
        address: clientPlayerAddress,
        cards: [],
        total: 0,
        isActive: true,
        isComputer: false,
        hasSkippedTurn: false,
        color: genRandomColor(),
      },
    ]);
    setRoomData(newRoom);
    socketService.emit("createRoom", {
      id: newRoom.id,
      creator: clientPlayerAddress,
    });
  };

  const joinRoom = (roomId: string) => {
    // add player to room on chain

    socketService.emit("joinRoom", roomId);
  };

  const startGame = () => {
    if (!roomData) return;

    setRoomData((prev) =>
      prev
        ? {
            ...prev,
            started: true,
          }
        : null
    );

    socketService.emit("startGame", roomData.id);
  };

  const drawCard = useCallback(() => {
    if (!roomData) return;
    if (isGameOver) return;

    // draw card from chain
    const newCard1 = Math.floor(Math.random() * (roomData.maxNumber / 3)) + 3; // Random number between 3 and Max Number
    const newCard2 = Math.floor(Math.random() * (roomData.maxNumber / 3)) + 3; // Random number between 3 and Max Number

    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];

    player.cards.push(newCard1, newCard2);
    player.total += newCard1 + newCard2;

    if (player.total > roomData.maxNumber) {
      player.isActive = false;
    } else if (player.total === roomData.maxNumber) {
      setWinner(currentPlayer);
      setIsGameOver(true);
    }

    setPlayers(updatedPlayers);
    nextTurn();
  }, [currentPlayer, isGameOver, roomData, players]);

  const skipTurn = useCallback(() => {
    if (isGameOver) return;
    if (players[currentPlayer].hasSkippedTurn) return;

    setPlayers((prev) => {
      const updatedPlayers = [...prev];
      updatedPlayers[currentPlayer].hasSkippedTurn = true;
      return updatedPlayers;
    });
    setTimeout(() => {
      nextTurn();
    }, 0)
    
  }, [isGameOver]);

  const nextTurn = useCallback(() => {
    let nextPlayer = (currentPlayer + 1) % players.length;
    while (!players[nextPlayer].isActive) {
      nextPlayer = (nextPlayer + 1) % players.length;
      if (nextPlayer === currentPlayer) {
        // If we've looped back to the current player, all other players are inactive
        setWinner(currentPlayer);
        setIsGameOver(true);
        return;
      }
    }
    setCurrentPlayer(nextPlayer);
  }, [currentPlayer, players]);

  const value = {
    clientPlayerAddress,
    availableRooms,
    roomData,
    players,
    currentPlayer,
    gameRound,
    scores,
    createRoom,
    joinRoom,
    startGame,
    drawCard,
    skipTurn,
    isGameOver,
    winner,
    error,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
