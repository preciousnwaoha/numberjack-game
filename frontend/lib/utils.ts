import { PlayerType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const genId = () => {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
};

export const bigIntToString = (bigInt: bigint) => {
  return ethers.formatEther(bigInt);
};

export const genRandomColor = () => {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}


export const randomPlayerColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

export const getNewPlayerDefault = (
  address: string,
  name?: string
): PlayerType => {
  return {
    name: name || "",
    address,
    draws: [],
    total: 0,
    isActive: true,
    hasSkippedTurn: false,
    color: randomPlayerColor(),
    claimed: false,
  };
};

export const getNextPlayerIndex = (
  players: PlayerType[],
  lastPlayerIndex: number
) => {
  const nextIndex = lastPlayerIndex + 1;
  return nextIndex >= players.length ? 0 : nextIndex;
};

export const playerFromContractToPlayerType = ({
  player,
}: {
  player: {
    address: string;
    draws: number[];
    total: number;
    isActive: boolean;
    hasSkippedTurn: boolean;
  };
}): PlayerType => {
  return {
    name: "",
    ...player,
    claimed: false,
    color: randomPlayerColor(),
  };
};



export const truncateAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Format seconds into mm:ss.
export const formatTime = (seconds:number ) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};