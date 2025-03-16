"use client";
import { ethers, Typed } from "ethers";
import NumberJackJSON from "./NumberJack.json";
import { bigIntToString } from "@/lib/utils";
import { errors } from "@/lib/errors";
import {
  ContractRoomType,
  EthersProvider,
  GameModeType,
  RoomType,
} from "@/types";
import {
  CORE_CHAIN_CONFIG,
  CORE_CHAIN_ID,
  GAME_CONTRACT_ADDRESS,
  MIN_FEE,
  TIME_TO_PLAY,
} from "@/lib/constants";

/**
 * Create a BrowserProvider and ensure that it is connected to the expected chain.
 */
export async function getCorrectChainProviderApi(expectedChainId: number) {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }

  // Instantiate the provider without specifying the chainId.
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Check the current network
  const network = await provider.getNetwork();

  // If the current chain doesn't match, prompt the user to switch
  if (network.chainId !== BigInt(expectedChainId)) {
    console.log(
      `Incorrect network detected: ${network.chainId}. Expected: ${expectedChainId}. Prompting user to switch...`
    );

    try {
      // First, try to add the chain if it's unrecognized.
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [CORE_CHAIN_CONFIG],
      });
    } catch (addError) {
      // If the chain is already added, wallet_addEthereumChain might fail, so we catch and log it.
      console.warn("Chain may already be added:", addError);
    }

    try {
      // MetaMask requires the chain id to be in hex format.
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toQuantity(expectedChainId) }],
      });
      // After switching, update the provider's network information.
      const updatedNetwork = await provider.getNetwork();
      if (updatedNetwork.chainId !== BigInt(expectedChainId)) {
        throw new Error("Failed to switch to the expected network.");
      }
    } catch (switchError) {
      console.error("Error switching networks:", switchError);
      throw switchError;
    }
  }

  return provider;
}

/**
 * connectWallet is called only when the user clicks a “Connect Wallet” button.
 * It handles the connection flow and sets the provider, signer, and connection status.
 */
export const connectWalletApi = async (): Promise<{
  connected: boolean;
  contract?: ethers.Contract;
  provider?: EthersProvider;
  signer: ethers.JsonRpcSigner | null;
  clientPlayerAddress: string;
  clientPlayerBalance: string;
  error: string | null;
}> => {
  const errorDefaults = {
    signer: null,
    clientPlayerAddress: "",
    clientPlayerBalance: "",
    contract: undefined,
  };
  if (typeof window.ethereum === "undefined" || !window.ethereum) {
    console.log("MetaMask not installed; falling back to read-only provider");
    const readOnlyProvider = ethers.getDefaultProvider();
    return {
      connected: false,
      provider: readOnlyProvider,
      error: errors.NO_WEB3_FOUND,
      ...errorDefaults,
    };
  }

  try {
    const _provider = await getCorrectChainProviderApi(CORE_CHAIN_ID);
    // Trigger connection on user action.
    const accounts = (await _provider.send(
      "eth_requestAccounts",
      []
    )) as string[];
    if (!accounts || accounts.length === 0) {
      return {
        connected: false,
        provider: _provider,
        error: errors.NO_ACCOUNTS_FOUND,
        ...errorDefaults,
      };
    }

    const _signer = await _provider.getSigner();
    const balance = await _provider.getBalance(accounts[0]);

    // If you plan on sending transactions, connect the contract with the signer.
    const _contract = new ethers.Contract(
      GAME_CONTRACT_ADDRESS,
      NumberJackJSON.abi,
      _signer
    );
    console.log("Wallet connected:", accounts[0]);

    return {
      connected: true,
      provider: _provider,
      signer: _signer,
      clientPlayerAddress: accounts[0].toLowerCase(),
      clientPlayerBalance: bigIntToString(balance),
      contract: _contract,
      error: null,
    };
  } catch (err) {
    console.error("Error connecting to Ethereum", err);
    return {
      connected: false,
      provider: undefined,
      error: errors.CONNECTION_ERROR,
      ...errorDefaults,
    };
  }
};

export interface CreateRoomApiParams {
  maxNumber: number;
  entryFee: number;
  mode: GameModeType;
  modeValue: number;
}

// C--reate a new game room by calling createGameRoom on the contract.
export const createRoomApi = async ({
  contract,
  ...newRoom
}: { contract: ethers.Contract } & CreateRoomApiParams) => {
  try {
    const entryFeeWei = ethers.parseEther(newRoom.entryFee.toString());
    console.log(newRoom);

    const tx = await contract["createGameRoom(uint256,uint8,uint256,uint256)"](
      BigInt(newRoom.maxNumber),
      0,
      BigInt(3),
      BigInt(TIME_TO_PLAY),
      { value: entryFeeWei, gasLimit: 1000000 }
    );
    await tx.wait();
    console.log("Room created successfully");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      error: errors.ERROR_CREATING_ROOM,
    };
  }
};

// Join an existing room.
export const joinRoomApi = async ({
  contract,
  roomId,
}: {
  contract: ethers.Contract;
  roomId: number;
}) => {
  try {
    // Retrieve room info first to obtain the correct entry fee.
    const roomRes = await getRoomByIdApi({ roomId, contract });
    if (roomRes.error || !roomRes.data) {
      return {
        error: roomRes.error,
      };
    }
    const entryFee = roomRes.data.entryFee;
    const entryFeeWei = ethers.parseEther(MIN_FEE.toString());
    console.log(entryFee, entryFeeWei);
    const tx = await contract.joinGameRoom(roomId, {
      value: entryFeeWei,
      gasLimit: 350000,
    });
    await tx.wait();
    console.log("Joined room successfully");
    return {
      success: true,
      data: roomRes.data,
    };
  } catch (_error) {
    console.error("Error joining room:", _error);
    return {
      error: errors.ERROR_JOINING_ROOM,
    };
  }
};

// Start the game by calling startGame on the contract.
export const startGameApi = async ({
  contract,
  roomId,
}: {
  contract: ethers.Contract;
  roomId: number;
}) => {
  try {
    const tx = await contract["startGame(uint256)"](roomId);
    await tx.wait();
    console.log("Game started successfully");
    return {
      success: true,
    };
  } catch (_error) {
    console.error("Error starting game", _error);
    return {
      error: errors.ERROR_STARTING_GAME,
    };
  }
};

export const endGameApi = async ({
  contract,
  roomId,
}: {
  contract: ethers.Contract;
  roomId: number;
}) => {
  try {
    const tx = await contract["endGame(uint256)"](roomId);
    await tx.wait();
    console.log("Game ended successfully");
    return {
      success: true,
    };
  } catch (_error) {
    console.error("Error ending game", _error);
    return {
      error: errors.ERROR_ENDING_GAME,
    };
  }
};

// For rounds mode, drawCard corresponds to playing a turn.
export const playTurnApi = async ({
  contract,
  roomId,
}: {
  contract: ethers.Contract;
  roomId: number;
}) => {
  try {
    const tx = await contract["playTurn(uint256)"](BigInt(roomId));
    await tx.wait();
    // Use callStatic to get the draws if needed:
    //   const [draw1, draw2] = await contract.callStatic.playTurn(roomData.id);
    const [draw1, draw2] = await contract.playTurn(Typed.uint256(roomId));
    console.log("Draws:", draw1.toString(), draw2.toString());
    return {
      success: true,
      data: [Number(draw1), Number(draw2)],
    };
  } catch (error) {
    console.error("Error playing turn:", error);
    return {
      error: errors.ERROR_PLAYING_TURN,
    };
  }
};

export const forceAdvanceApi = async ({
  roomId,
  contract,
}: {
  contract: ethers.Contract;
  roomId: number;
}) => {
  try {
    const tx = await contract.forceAdvance(roomId);
    await tx.wait();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error playing turn:", error);
    return {
      error: errors.ERROR_PLAYING_TURN,
    };
  }
};

// Skip the current turn.
export const skipTurnApi = async ({
  contract,
  roomId,
}: {
  contract: ethers.Contract;
  roomId: number;
}) => {
  try {
    const tx = await contract["skipTurn(uint256)"](BigInt(roomId));
    await tx.wait();
    console.log("Turn skipped successfully");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error skipping turn:", error);
    return {
      error: errors.ERROR_SKIPPING,
    };
  }
};

// Retrieve all available rooms by calling getAllRooms on the contract.
export const getAvailableRoomsApi = async ({
  contract,
}: {
  contract: ethers.Contract;
}) => {
  try {
    const rooms = await contract.getAvailableRooms();
    const mappedRooms: RoomType[] = rooms.map(
      (room: ContractRoomType, index: number): RoomType => ({
        creator: room.creator,
        name: "Room " + (index + 1),
        id: Number(room.id).toString(),
        players: [...room.players.map((addr: string) => addr.toLowerCase())],
        mode: room.mode.toString() === "0" ? "Rounds" : "TimeBased",
        roundValue: Number(room.roundValue),
        roundCurrentValue: 1,
        maxNumber: Number(room.maxNumber),
        isActive: room.isActive,
        status:
          room.status.toString() === "0"
            ? "NotStarted"
            : room.status.toString() === "1"
            ? "InProgress"
            : "Ended",
        entryFee: Number(room.entryFee),
        startTime: Number(room.startTime),
        duration: Number(room.duration),
        currentPlayerIndex: Number(room.currentPlayerIndex),
        lastTurnTimestamp: Number(room.lastTurnTimestamp),
        turnTimeout: Number(room.turnTimeout),
      })
    );
    return {
      success: true,
      data: mappedRooms,
    };
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return {
      error: errors.ERROR_FETCHING_ROOMS,
    };
  }
};

// Retrieve players from the current room and update local state.
export const getPlayersApi = async ({
  roomId,
  contract,
}: {
  roomId: number;
  contract: ethers.Contract;
}) => {
  try {
    const roomRes = await getRoomByIdApi({ roomId, contract });
    if (roomRes.error || !roomRes.data) {
      return {
        error: roomRes.error,
      };
    }
    const room = roomRes.data;
    const playerAddresses: string[] = room.players.map((addr: string) =>
      addr.toLowerCase()
    );
    const updatedPlayers = await Promise.all(
      playerAddresses.map(async (addr: string) => {
        const playerRes = await getRoomPlayerApi({
          contract,
          roomId,
          playerAddress: addr,
        });

        if (playerRes.error || !playerRes.data) {
          throw new Error(playerRes.error);
        }
        return playerRes.data;
      })
    );
    return {
      success: true,
      data: updatedPlayers,
    };
  } catch (error) {
    console.error("Error fetching players:", error);
    return {
      error: errors.ERROR_FETCHING_PLAYERS,
    };
  }
};

export const getRoomByIdApi = async ({
  roomId,
  contract,
}: {
  roomId: number;
  contract: ethers.Contract;
}) => {
  try {
    const room = await contract.getGameRoomById(roomId);
    const fomattedRoom: RoomType = {
      creator: room.creator,
      name: "Room " + roomId, // use a naming convention or fetch actual name
      id: Number(roomId).toString(),
      players: room.players.map((addr: string) => addr.toLowerCase()),
      mode: room.mode.toString() === "0" ? "Rounds" : "TimeBased",
      roundValue: Number(room.roundValue),
      roundCurrentValue: 1,
      maxNumber: Number(room.maxNumber),
      isActive: room.isActive,
      status:
        room.status.toString() === "0"
          ? "NotStarted"
          : room.status.toString() === "1"
          ? "InProgress"
          : "Ended",
      entryFee: Number(room.entryFee),
      startTime: Number(room.startTime),
      duration: Number(room.duration),
      currentPlayerIndex: Number(room.currentPlayerIndex),
      lastTurnTimestamp: Number(room.lastTurnTimestamp),
      turnTimeout: Number(room.turnTimeout),
    };
    return {
      success: true,
      data: fomattedRoom,
    };
  } catch (error) {
    console.error("Error fetching room:", error);
    return {
      error: errors.ERROR_FETCHING_ROOM,
    };
  }
};

export const getRoomPlayerApi = async ({
  contract,
  roomId,
  playerAddress,
}: {
  contract: ethers.Contract;
  roomId: number;
  playerAddress: string;
}) => {
  try {
    const draws: number[] = await contract.getPlayerDrawsForGameRoom(
      roomId,
      playerAddress
    );

    const eliminated = await contract.getIsPlayerEliminatedByRoomId(
      roomId,
      playerAddress
    );

    const mapedDraws = draws.map((draw) => Number(draw));
    const total = mapedDraws.reduce((acc, curr) => acc + curr, 0);

    return {
      success: true,
      data: {
        address: playerAddress,
        draws: mapedDraws,
        total,
        isActive: Boolean(eliminated),
      },
    };
  } catch (error) {
    console.error("Error fetching player:", error);
    return {
      error: errors.ERROR_FETCHING_PLAYERS,
    };
  }
};

export const getPlayerRoomApi = async ({
  playerAddress,
  contract,
}: {
  playerAddress: string;
  contract: ethers.Contract;
}) => {
  try {
    const allRooms = await contract.getAllGameRooms();

    console.log("getPlayerRoomApi: All rooms:", allRooms);
    

    const allRoomsToRoomType: RoomType[] = allRooms.map(
      (room: ContractRoomType) => ({
        creator: room.creator,
        name: "Room " + room.id,
        id: Number(room.id).toString(),
        players: room.players.map((addr: string) => addr.toLowerCase()),
        mode: room.mode.toString() === "0" ? "Rounds" : "TimeBased",
        roundValue: Number(room.roundValue),
        roundCurrentValue: 1,
        maxNumber: Number(room.maxNumber),
        isActive: room.isActive,
        status:
          Number(room.status).toString() === "0"
            ? "NotStarted"
            : Number(room.status).toString() === "1"
            ? "InProgress"
            : "Ended",
        entryFee: Number(room.entryFee),
        startTime: Number(room.startTime),
        duration: Number(room.duration),
        currentPlayerIndex: Number(room.currentPlayerIndex),
        lastTurnTimestamp: Number(room.lastTurnTimestamp),
        turnTimeout: Number(room.turnTimeout),
      })
    );

    console.log("getPlayerRoomApi: All rooms to RoomType:", allRoomsToRoomType);

    const playerRoom = allRoomsToRoomType
      .filter((r) => r.status !== "Ended")
      .find((room) => {
        console.log(
          "getPlayerRoomApi: Player address:",
          playerAddress.toLowerCase()
        );
        console.log("getPlayerRoomApi: Room players:", room.players);
        return room.players.includes(playerAddress.toLowerCase());
      });

    console.log("getPlayerRoomApi: Player room:", playerRoom);

    if (!playerRoom) {
      return {
        error: errors.ERROR_FETCHING_ROOM,
      };
    }

    const playersRes = await getPlayersApi({
      roomId: Number(playerRoom?.id),
      contract,
    });

    console.log("getPlayerRoomApi: Players:", playersRes);

    if (playersRes.error || !playersRes.data) {
      return {
        error: playersRes.error,
      };
    }

    return {
      success: true,
      data: {
        room: playerRoom,
        players: playersRes.data,
      },
    };
  } catch (error) {
    console.error("Error fetching player room:", error);
    return {
      error: errors.ERROR_FETCHING_PLAYERS,
    };
  }
};
