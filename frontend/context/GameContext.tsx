"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

import { errors } from "@/lib/errors";
import { EthersProvider, PlayerType, RecentActivity, RoomType } from "@/types";
import {
  connectWalletApi,
  createRoomApi,
  CreateRoomApiParams,
  endGameApi,
  forceAdvanceApi,
  getAvailableRoomsApi,
  getPlayerRoomApi,
  getPlayersApi,
  joinRoomApi,
  playTurnApi,
  skipTurnApi,
  startGameApi,
} from "@/lib/contracts/api";
import useSocket from "@/hooks/use-socket";
import useContractEvents from "@/hooks/use-contractEvents";
// import useNetwork from "@/hooks/use-network";
import { randomPlayerColor } from "@/lib/utils";

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
  recentActivities: RecentActivity[];
  notification: Notification | null;
  createRoom: (room: CreateRoomApiParams) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  forceAdvance: () => Promise<void>;
  endGame: () => Promise<void>;
  startGame: () => Promise<void>;
  drawCard: () => Promise<void>;
  skipTurn: () => Promise<void>;
  getAvailableRooms: () => Promise<void>;
  getPlayers: (roomId: string) => Promise<void>;
  connect: () => Promise<void>;
  error: string;
  loading: string;
  onLoading: (message: string) => void;
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
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [notification, setNotification] = useState<Notification | null>(null);

  const { socketEmitter } = useSocket({
    setPlayers,
    setRoomData,
    setAvailableRooms,
    players,
    roomData,
  });

  useContractEvents({
    socketEmitter,
    contract,
    setRoomData,
    setAvailableRooms,
    setPlayers,
    setRecentActivities,
    clientPlayerAddress,
    roomData,
    availableRooms,
  });

  // useNetwork({
  //   setConnected,
  //   setClientPlayerAddress,
  //   setSigner,
  // });

  useEffect(() => {
    if (notification) {
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, [notification]);

  useEffect(() => {
    const getPlayerAndRoomData = async () => {
      if (connected && contract && clientPlayerAddress) {
        console.log("Starting getPlayerRoomApi");
        const { error, data } = await getPlayerRoomApi({
          contract,
          playerAddress: clientPlayerAddress.toLowerCase(),
        });

        console.log("Checking Data: ", { error, data });

        if (error) {
          setError(error);
          return;
        }

        if (data) {
          setRoomData(data.room);
          setPlayers((prev) => {
            return data.players.map((_player) => {
              const playerInStore = prev.find(
                (p) => p.address === _player.address
              );

              if (playerInStore) {
                return {
                  ...playerInStore,
                  ..._player,
                };
              } else {
                return {
                  name: "Random Name",
                  address: _player.address,
                  draws: _player.draws,
                  total: _player.total,
                  isActive: _player.isActive,
                  hasSkippedTurn: false, // TODO: provide player hasSkipped
                  color: randomPlayerColor(),
                  claimed: false,
                };
              }
            });
          });

          
        }
      }
    };

    console.log("Effect check: ", {
      connected,
      contract,
      clientPlayerAddress,
    });
    if (connected && contract && clientPlayerAddress) {
      console.log("Connected, getting player and room data");
      getPlayerAndRoomData();
    }
  }, [connected, contract, clientPlayerAddress]);

  const handleLoading = (message: string) => {
    setLoading(message);
  };

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
  const joinRoom = async (roomId: string) => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    const { error } = await joinRoomApi({
      roomId: Number(roomId),
      contract,
    });
    if (error) {
      setError(error);
      return;
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
      roomId: Number(roomData.id),
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

    const { data, error } = await playTurnApi({
      roomId: Number(roomData.id),
      contract,
    });

    if (error) {
      setError(error);
      return;
    }

    if (data) {
      // Update the player's draws and total score.
      setPlayers((prev) => {
        const updatedPlayers = prev.map((p) => {
          if (p.address === clientPlayerAddress.toLowerCase()) {
            return {
              ...p,
              draws: [...p.draws, ...data],
              total: p.total + data[0] + data[1],
            };
          }
          return p;
        });

        return updatedPlayers;
      });

      // Emit the draw event to the socket.
      socketEmitter("playerDraw", {
        roomId: roomData.id,
        playerAddress: clientPlayerAddress.toLowerCase(),
        draws: data,
      });
    }
  };

  const forceAdvance = async () => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    const { error } = await forceAdvanceApi({
      roomId: Number(roomData.id),
      contract,
    });

    if (error) {
      setError(error);
      return;
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

    const { error, success } = await skipTurnApi({
      roomId: Number(roomData.id),
      contract,
    });

    if (error) {
      setError(error);
      return;
    }

    if (success) {
      setPlayers((prev) => {
        const updatedPlayers = prev.map((p) => {
          if (p.address === clientPlayerAddress.toLowerCase()) {
            return {
              ...p,
              hasSkippedTurn: true,
            };
          }
          return p;
        });

        return updatedPlayers;
      });

      socketEmitter("playerSkip", {
        roomId: roomData.id,
        playerAddress: clientPlayerAddress.toLowerCase(),
      });
    }
  };

  // Retrieve all available rooms by calling getAllRooms on the contract.
  const getAvailableRooms = async () => {
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }
    setLoading("Fetching available rooms...");
    const { error, success, data } = await getAvailableRoomsApi({
      contract,
    });

    if (error) {
      setError(error);
      setLoading("");
      return;
    }

    if (success && data) {
      setAvailableRooms(data);
      setLoading("");
    }
  };

  // Retrieve players from the current room and update local state.
  const getPlayers = async (roomId: string) => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    const { error, data } = await getPlayersApi({
      roomId: Number(roomId),
      contract,
    });

    if (error || !data) {
      setError(error);
      return;
    }

    setPlayers((prev) => {
      return data.map((_player) => {
        const playerInStore = prev.find((p) => p.address === _player.address);

        if (playerInStore) {
          return {
            ...playerInStore,
            ..._player,
          };
        } else {
          return {
            name: "Random Name",
            address: _player.address,
            draws: _player.draws,
            total: _player.total,
            isActive: _player.isActive,
            hasSkippedTurn: false, // TODO: provide player hasSkipped
            color: randomPlayerColor(),
            claimed: false,
          };
        }
      });
    });
  };

  const endGame = async () => {
    if (!roomData) {
      setError(errors.NO_GAME_ROOM_FOUND);
      return;
    }
    if (!contract) {
      setError(errors.NO_CONTRACT_FOUND);
      return;
    }

    const { error, success } = await endGameApi({
      roomId: Number(roomData.id),
      contract,
    });

    if (error) {
      setError(error);
      return;
    }

    if (success) {
      setPlayers([]);
      setRoomData(null);
    }
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
    recentActivities,
    notification,
    createRoom,
    joinRoom,
    endGame,
    startGame,
    drawCard,
    forceAdvance,
    skipTurn,
    getAvailableRooms,
    getPlayers,
    connect: connectWallet,
    onLoading: handleLoading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
