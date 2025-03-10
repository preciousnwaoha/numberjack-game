"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers, Typed } from "ethers";
import { socketService } from "@/services/socket";

import { errors } from "@/lib/errors";
import {
  EthersProvider,
  GameModeType,
  GameStatusType,
  PlayerType,
  RoomType,
} from "@/types";
import {
  connectWalletApi,
  createRoomApi,
  CreateRoomApiParams,
  getAvailableRoomsApi,
  getPlayersApi,
  joinRoomApi,
  playTurnApi,
  skipTurnApi,
  startGameApi,
} from "@/lib/contracts/api";

interface GameContextType {
  contract?: ethers.Contract;
  provider?: EthersProvider;
  signer: ethers.JsonRpcSigner | null;
  connected: boolean;
  clientPlayerAddress: string;
  clientPlayerBalance: string;
  availableRooms: RoomType[];
  roomData: RoomType | null;
  players: PlayerType[];
  createRoom: (room: CreateRoomApiParams) => Promise<void>;
  joinRoom: (roomId: number) => Promise<void>;
  startGame: () => Promise<void>;
  drawCard: () => Promise<void>;
  skipTurn: () => Promise<void>;
  getAvailableRooms: () => Promise<void>;
  getPlayers: () => Promise<void>;
  connect: () => Promise<void>;
  error: string;
  loading: string;
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
  const [contract, setContract] = useState<ethers.Contract | undefined>(
    undefined
  );
  const [provider, setProvider] = useState<EthersProvider>(undefined);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [connected, setConnected] = useState(false);
  const [clientPlayerAddress, setClientPlayerAddress] = useState<string>("");
  const [clientPlayerBalance, setClientPlayerBalance] = useState("");
  const [roomData, setRoomData] = useState<RoomType | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([]);
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  // Listen for account or network changes and update connection state accordingly.
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Wallet disconnected or locked
          setConnected(false);
          setClientPlayerAddress("");
          setSigner(null);
        } else {
          // Optionally, update the current account.
          setClientPlayerAddress(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reloading ensures the app resets with the new network.
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", () => handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  // Optionally, check on load if the user already connected (without forcing connection).
  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      // If an address is already available, you may want to update state,
      // but you might also wait for a manual re-connect for better UX.
      setClientPlayerAddress(window.ethereum.selectedAddress);
      setConnected(true);
    }
  }, []);

  // A separate effect for handling contract events.
  useEffect(() => {
    if (!contract) return;
    // Define contract event handlers
    const handleGameRoomCreated = (...args: unknown[]) => {
      if (clientPlayerAddress === args[1]) {
        setRoomData({
          creator: args[1],
          name: "Some Room Name",
          id: Number(args[0]),
          players: [clientPlayerAddress],
          mode: "Rounds" as GameModeType,
          modeValue: Number(args[4]),
          modeCurrentValue: 1,
          maxNumber: Number(args[2]),
          isActive: true,
          status: "NotStarted" as GameStatusType,
          entryFee: Number(args[3]),
          startTime: 0,
          endTime: 0,
          currentPlayerIndex: 0,
          lastTurnTimestamp: 0,
          turnTimeout: 0,
        });
      } else {
        getAvailableRooms();
      }
    };

    const handlePlayerJoined = (gameId: number, player: string) => {
      console.log("Game Room Joined:", gameId, player);
      getPlayers();
      // Optionally: refresh player list.
    };

    const handleGameStarted = (...args: unknown[]) => {
      console.log("Game Started:", args);

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
    contract.on("PlayerPlayed", handleTurnPlayed);
    contract.on("TurnSkipped", handleTurnSkipped);

    return () => {
      if (contract) {
        contract.removeListener("GameRoomCreated", handleGameRoomCreated);
        contract.removeListener("PlayerJoined", handlePlayerJoined);
        contract.removeListener("GameStarted", handleGameStarted);
        contract.removeListener("PlayerPlayed", handleTurnPlayed);
        contract.removeListener("TurnSkipped", handleTurnSkipped);
      }
    };
  }, [contract]);

  const connectWallet = async () => {
    const {
      provider,
      signer,
      contract,
      connected,
      clientPlayerAddress,
      clientPlayerBalance,
      error,
    } = await connectWalletApi();

    if (error) {
      setError(error);
      return;
    } else {
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setConnected(connected);
      setClientPlayerAddress(clientPlayerAddress);
      setClientPlayerBalance(clientPlayerBalance);
    }
  };

  // Create a new game room by calling createGameRoom on the contract.
  const createRoom = async (newRoom: CreateRoomApiParams) => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    const { error } = await createRoomApi({ ...newRoom, contract });

    if (error) {
      setError(error);
      return;
    }
  };

  // Join an existing room.
  const joinRoom = async (roomId: number) => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    const { error, data } = await joinRoomApi({
      roomId,
      contract,
    });
    if (error) {
      setError(error);
      return;
    }
    if (data) {
      setRoomData(data);
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

    const { error } = await startGameApi({
      roomId: roomData.id,
      contract,
    });

    if (error) {
      setError(error);
      return;
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

    const { draws, error } = await playTurnApi({
      roomId: roomData.id,
      contract,
    });

    if (error) {
      setError(error);
      return;
    }

    // TODO: Add draws to player
    // socketService.emit("playerMoved", {
    //   playerId: clientPlayerAddress,
    //   move: { draw1: draw1.toString(), draw2: draw2.toString() },
    // });
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

    const { error } = await skipTurnApi({
      roomId: roomData.id,
      contract,
    });

    if (error) {
      setError(error);
      return;
    }
  };

  // Retrieve all available rooms by calling getAllRooms on the contract.
  const getAvailableRooms = async () => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    const { error, success, data } = await getAvailableRoomsApi({
      contract,
    });

    if (error) {
      setError(error);
      return;
    }

    if (success && data) {
      setAvailableRooms(data);
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

    const { error, data } = await getPlayersApi({
      roomId: roomData.id,
      contract,
    });

    if (error || !data) {
      setError(error);
      return;
    }

    const updatedPlayers = data
      .map((_player) => {
        const playerInStore = players.find(
          (p) => p.address === _player.address
        );
        if (playerInStore) {
          return {
            ...playerInStore,
            ..._player,
          };
        }
      })
      .filter(Boolean) as PlayerType[];
    setPlayers(updatedPlayers);
  };

  const value: GameContextType = {
    contract,
    provider,
    signer,
    connected,
    clientPlayerAddress,
    clientPlayerBalance,
    error,
    loading,
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
    connect: connectWallet,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
