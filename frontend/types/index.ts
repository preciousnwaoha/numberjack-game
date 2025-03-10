import type { ethers } from "ethers";

export interface PlayerType {
  name: string;
  address: string,
  draws: number[];
  total: number;
  isActive: boolean;
  hasSkippedTurn: boolean;
  color: string;
  claimed: boolean;
}

export type GameModeType = "Rounds" | "TimeBased";

export type GameStatusType = "NotStarted" | "InProgress" | "Ended";

export type ContractRoomType = {
  creator: string;
  id: string;
  maxNumber: number;
  entryFee: number;
  players: string[];
  isActive: boolean;
  status: number;
  mode: number;
  modeValue: number;
  startTime: number;
  endTime: number;
  currentPlayerIndex: number;
  lastTurnTimestamp: number;
  turnTimeout: number;
}


export interface RoomType {
  creator: string; // address of creatoe
  name: string;
  id: number;
  players: string[]; // Number of players expected when creating room
  mode: GameModeType;
  modeValue: number;
  modeCurrentValue: number;
  maxNumber: number;
  isActive: boolean;
  status: GameStatusType;
  entryFee: number;
  startTime: number;
  endTime: number;
  currentPlayerIndex: number;
  lastTurnTimestamp: number;
  turnTimeout: number;
}


export interface GameType {
  roomId: number,
  players: PlayerType[],
  winner: string,
}


export type EthersProvider =
  | ethers.BrowserProvider
  | ethers.AbstractProvider
  | undefined;

