"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers, Typed } from "ethers";
import { socketService } from "@/services/socket";
import NumberJackJSON from "../lib/contracts/NumberJack.json"; // Assumes ABI file is here
import {
  bigIntToString,
  getNewPlayerDefault,
  getNextPlayerIndex,
  randomPlayerColor,
} from "@/lib/utils";
import { errors } from "@/lib/errors";
import { PlayerType, RoomType } from "@/types";

type EthersProvider = ethers.BrowserProvider | ethers.AbstractProvider | undefined;

interface GameContextType {
  contract?: ethers.Contract;
  provider?: EthersProvider;
  signer?: ethers.JsonRpcSigner;

  clientPlayerAddress: string;
  clientPlayerBalance: string;
  availableRooms: RoomType[];
  roomData: RoomType | null;
  players: PlayerType[];
  createRoom: (room: RoomType) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  startGame: () => Promise<void>;
  drawCard: () => Promise<void>;
  skipTurn: () => Promise<void>;
  getAvailableRooms: () => Promise<void>;
  getPlayers: () => Promise<void>;
  connect: () => Promise<void>;
  error: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

// Replace with your deployed contract address
const contractAddress = "0xYourContractAddress";

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contract, setContract] = useState<ethers.Contract | undefined>(
    undefined
  );
  const [provider, setProvider] = useState<EthersProvider>(
    undefined
  );
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const [clientPlayerAddress, setClientPlayerAddress] = useState<string>("");
  const [clientPlayerBalance, setClientPlayerBalance] = useState("");
  const [roomData, setRoomData] = useState<RoomType | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [error, setError] = useState("");

  // Helper to get contract instance using ethers.
  const initConnection = useCallback(async () => {
    if (typeof window.ethereum === "undefined" || !window.ethereum) {
      setError(errors.NO_WEB3_FOUND);
      // If MetaMask is not installed, we use the default provider,
      console.log("MetaMask not installed; using read-only defaults");
      const _provider = ethers.getDefaultProvider();
      setProvider(_provider);

    } else {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum, {
          chainId: 1337, // Hardcoded for local network
        });
        const _signer = await _provider.getSigner();
        await _provider.send("eth_accounts", []);
        const accounts = (await _provider.send(
          "eth_requestAccounts",
          []
        )) as string[];
        // const accounts = await window.ethereum.request({method: 'eth_accounts'}) as string[];

        if (!accounts || accounts.length === 0) {
          setError(errors.NO_ACCOUNTS_FOUND);
          throw new Error("No accounts found");
        }

        const balance = await _provider.getBalance(accounts[0]);
        console.log("Connected to Ethereum:", accounts[0], balance.toString());

        const _contract = new ethers.Contract(
          contractAddress,
          NumberJackJSON.abi,
          _provider
        );

        setProvider(_provider);
        setSigner(_signer);
        setClientPlayerAddress(accounts[0]);
        setClientPlayerBalance(bigIntToString(balance));
        setContract(_contract);
      } catch (error) {
        console.error("Error connecting to Ethereum", error);
        throw new Error("Error connecting to Ethereum");
      }
    }
  }, []);

  useEffect(() => {
    // Connect the socket
    socketService.connect();
    socketService.on("connect", () => {
      console.log("✅ WebSocket connected to server");
    });
    // Socket event listeners
    socketService.on("roomCreated", (_room: RoomType) => {
      console.log("🚀 Game Created!", _room.id);
      if (!roomData) setAvailableRooms([...availableRooms, _room]);
    });
    socketService.on(
      "playerJoined",
      (data: { roomId: string; player: string }) => {
        const { roomId, player } = data;
        console.log("🏠 Player Joined Room:", roomId);
        if (roomData?.id === Number(roomId)) {
          const updatedPlayers = [...players, getNewPlayerDefault(player)];
          setPlayers(updatedPlayers);
          setRoomData((prev) =>
            prev ? { ...prev, players: [...prev.players, player] } : null
          );
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
          setPlayers(updatedPlayers);
          setRoomData((prev) =>
            prev
              ? { ...prev, players: prev.players.filter((p) => p !== player) }
              : null
          );
        }
      }
    );
    socketService.on("gameStarted", () => {
      console.log("🚀 Game Started!");
      if (roomData) {
        const updatedRoom: RoomType = { ...roomData, status: "InProgress" };
        setRoomData(updatedRoom);
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
          setPlayers(updatedPlayers);
          setRoomData((prev) =>
            prev
              ? {
                  ...prev,
                  currentPlayerIndex: getNextPlayerIndex(
                    players,
                    prev.currentPlayerIndex
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
          setPlayers(updatedPlayers);
          setRoomData((prev) =>
            prev
              ? {
                  ...prev,
                  currentPlayerIndex: getNextPlayerIndex(
                    players,
                    prev.currentPlayerIndex
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
          setPlayers(updatedPlayers);
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
          setPlayers(updatedPlayers);
          setRoomData((prev) => (prev ? { ...prev, status: "Ended" } : null));
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
          setPlayers(updatedPlayers);
        }
      }
    );
    socketService.on("roomClosed", (roomId: string) => {
      console.log("🚀 Game Created!", roomId);
      const updatedRooms = availableRooms.filter(
        (room) => room.id !== Number(roomId)
      );
      if (roomData?.status === "NotStarted") setAvailableRooms(updatedRooms);
    });

    // Initialize the Ethereum connection.
    (async () => {
      try {
        await initConnection();
      } catch (err) {
        console.error("Error during initConnection", err);
      }
    })();

    return () => {
      socketService.disconnect();
    };
  }, []);

  // A separate effect for handling contract events.
  useEffect(() => {
    if (!contract) return;
    // Define contract event handlers
    const handleGameRoomCreated = (
      gameId: number,
      creator: string,
      entryFee: bigint,
      mode: number
    ) => {
      console.log(
        "Game Room Created:",
        gameId,
        creator,
        entryFee.toString(),
        mode
      );
      getAvailableRooms();
    };

    const handlePlayerJoined = (gameId: number, player: string) => {
      console.log("Game Room Joined:", gameId, player);
      getPlayers();
      // Optionally: refresh player list.
    };

    const handleGameStarted = (gameId: number) => {
      console.log("Game Started:", gameId);
      getPlayers();
    };

    const handleTurnPlayed = (
      gameId: number,
      player: string,
      draw1: number,
      draw2: number
    ) => {
      console.log("Turn Played:", gameId, player, draw1, draw2);
      getPlayers();
    };

    const handleTurnSkipped = (gameId: number, player: string) => {
      console.log("Turn Played:", gameId, player);
      getPlayers();
    };

    // Listen for events from the contract
    contract.on("GameRoomCreated", handleGameRoomCreated);
    contract.on("PlayerJoined", handlePlayerJoined);
    contract.on("GameStarted", handleGameStarted);
    // contract.on("TurnPlayed", handleTurnPlayed);
    contract.on("TurnSkipped", handleTurnSkipped);

    return () => {
      if (contract) {
        contract.removeListener("GameRoomCreated", handleGameRoomCreated);
        contract.removeListener("PlayerJoined", handlePlayerJoined);
        contract.removeListener("GameStarted", handleGameStarted);
        contract.removeListener("TurnPlayed", handleTurnPlayed);
        contract.removeListener("TurnSkipped", handleTurnSkipped);
      }
    };
  }, [contract]);

  const handleConnect = async () => {
    try {
      await initConnection();
    } catch (error) {
      console.error("Error connecting to Ethereum", error);
    }
  };

  // Create a new game room by calling createGameRoom on the contract.
  const createRoom = async (newRoom: RoomType) => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    try {
      // Map GameMode string to the corresponding enum (Rounds = 0, TimeBased = 1)
      const modeEnum = newRoom.mode === "Rounds" ? 0 : 1;
      const tx = await contract.createGameRoom(
        Typed.uint256(newRoom.maxNumber),
        Typed.uint256(newRoom.entryFee),
        Typed.uint8(modeEnum),
        Typed.uint256(newRoom.modeValue),
        Typed.uint256(newRoom.turnTimeout),
        { value: newRoom.entryFee } // entry fee is sent with the transaction
      );
      await tx.wait();
      console.log("Room created successfully");
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  // Join an existing room.
  const joinRoom = async (roomId: string) => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    try {
      // Retrieve room info first to obtain the correct entry fee.
      const room = await contract.getGameRoomById(roomId);
      const entryFee = room.entryFee;
      const tx = await contract.joinGameRoom(roomId, { value: entryFee });
      await tx.wait();
      console.log("Joined room successfully");
      const updatedRoom = await contract.getGameRoomById(roomId);
      setRoomData({
        creator: updatedRoom.creator,
        name: "Room " + roomId, // use a naming convention or fetch actual name
        id: Number(roomId),
        players: updatedRoom.players.length,
        mode: updatedRoom.mode.toString() === "0" ? "Rounds" : "TimeBased",
        modeValue:
          updatedRoom.mode.toString() === "0"
            ? Number(updatedRoom.rounds)
            : Number(updatedRoom.duration),
        modeCurrentValue: 0,
        maxNumber: Number(updatedRoom.maxNumber),
        isActive: updatedRoom.isActive,
        status:
          updatedRoom.status.toString() === "0"
            ? "NotStarted"
            : updatedRoom.status.toString() === "1"
            ? "InProgress"
            : "Ended",
        entryFee: Number(updatedRoom.entryFee),
        startTime: Number(updatedRoom.startTime),
        duration: Number(updatedRoom.duration),
        currentPlayerIndex: Number(updatedRoom.currentPlayerIndex),
        lastTurnTimestamp: Number(updatedRoom.lastTurnTimestamp),
        turnTimeout: Number(updatedRoom.turnTimeout),
      });
      await getPlayers();
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  // Start the game by calling startGame on the contract.
  const startGame = async () => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    try {
      const tx = await contract.startGame(roomData.id);
      await tx.wait();
      console.log("Game started successfully");
      const updatedRoom = await contract.getGameRoomById(roomData.id);
      setRoomData({
        creator: updatedRoom.creator,
        name: roomData.name,
        id: Number(roomData.id),
        players: updatedRoom.players.length,
        mode: updatedRoom.mode.toString() === "0" ? "Rounds" : "TimeBased",
        modeValue:
          updatedRoom.mode.toString() === "0"
            ? Number(updatedRoom.rounds)
            : Number(updatedRoom.duration),
        modeCurrentValue: 0,
        maxNumber: Number(updatedRoom.maxNumber),
        isActive: updatedRoom.isActive,
        status:
          updatedRoom.status.toString() === "0"
            ? "NotStarted"
            : updatedRoom.status.toString() === "1"
            ? "InProgress"
            : "Ended",
        entryFee: Number(updatedRoom.entryFee),
        startTime: Number(updatedRoom.startTime),
        duration: Number(updatedRoom.duration),
        currentPlayerIndex: Number(updatedRoom.currentPlayerIndex),
        lastTurnTimestamp: Number(updatedRoom.lastTurnTimestamp),
        turnTimeout: Number(updatedRoom.turnTimeout),
      });
      socketService.emit("gameStarted", roomData.id);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  // For rounds mode, drawCard corresponds to playing a turn.
  const drawCard = async () => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    try {
      if (!roomData) throw new Error("No room selected");

      const tx = await contract.playTurn(roomData.id);
      await tx.wait();
      // Use callStatic to get the draws if needed:
      //   const [draw1, draw2] = await contract.callStatic.playTurn(roomData.id);
      const [draw1, draw2] = await contract.playTurn(
        Typed.uint256(roomData.id)
      );
      console.log("Draws:", draw1.toString(), draw2.toString());
      await getPlayers();
      socketService.emit("playerMoved", {
        playerId: clientPlayerAddress,
        move: { draw1: draw1.toString(), draw2: draw2.toString() },
      });
    } catch (error) {
      console.error("Error drawing card:", error);
    }
  };

  // Skip the current turn.
  const skipTurn = async () => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    try {
      const tx = await contract.skipTurn(roomData.id);
      await tx.wait();
      console.log("Turn skipped successfully");
      await getPlayers();
      socketService.emit("playerMoved", {
        playerId: clientPlayerAddress,
        move: "skipTurn",
      });
    } catch (error) {
      console.error("Error skipping turn:", error);
    }
  };

  // Retrieve all available rooms by calling getAllRooms on the contract.
  const getAvailableRooms = async () => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    try {
      const rooms = await contract.getAllRooms(); // assumed to exist
      const mappedRooms: RoomType[] = rooms.map(
        (room: RoomType, index: number) => ({
          creator: room.creator,
          name: "Room " + (index + 1),
          id: Number(room.id),
          players: room.players.length,
          mode: room.mode.toString() === "0" ? "Rounds" : "TimeBased",
          modeValue:
            room.mode.toString() === "0"
              ? Number(room.modeValue) // rounds
              : Number(room.duration),
          modeCurrentValue: 0,
          maxNumber: Number(room.maxNumber),
          isActive: room.isActive,
          status:
            room.status.toString() === "0"
              ? "NotStarted"
              : room.status.toString() === "1"
              ? "InProgress"
              : "Ended",
          started: room.startTime > 0,
          entryFee: Number(room.entryFee),
          startTime: Number(room.startTime),
          duration: Number(room.duration),
          currentPlayerIndex: Number(room.currentPlayerIndex),
          lastTurnTimestamp: Number(room.lastTurnTimestamp),
          turnTimeout: Number(room.turnTimeout),
        })
      );
      setAvailableRooms(mappedRooms);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  // Retrieve players from the current room and update local state.
  const getPlayers = async () => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    try {
      const room = await contract.getGameRoomById(roomData.id);
      const playerAddresses: string[] = room.players;
      const updatedPlayers: PlayerType[] = await Promise.all(
        playerAddresses.map(async (addr: string, index: number) => {
          const scoreBN = await contract.getPlayerScoresForEachGameRoom(
            roomData.id,
            addr
          );
          const score = Number(scoreBN);
          const eliminated = await contract.getIsPlayerEliminatedByRoomId(
            roomData.id,
            addr
          );

          const existingPlayer = players.find((p) => p.address === addr);
          let color = randomPlayerColor();
          let name = "Player" + (index + 1);
          if (existingPlayer) {
            color = existingPlayer.color;
            name = existingPlayer.name;
          }

          return {
            name,
            address: addr,
            draws: [], // TODO: fetch draws
            total: score,
            isActive: !eliminated,
            hasSkippedTurn: false,
            color,
            claimed: false,
          };
        })
      );
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const value: GameContextType = {
    contract,
    provider,
    clientPlayerAddress,
    clientPlayerBalance,
    error,
    availableRooms,
    roomData,
    players,
    createRoom,
    joinRoom,
    startGame,
    drawCard,
    skipTurn,
    getAvailableRooms,
    getPlayers,
    connect: handleConnect,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
