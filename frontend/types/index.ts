import type { ethers } from "ethers";
export interface PlayerType {
  name: string;
  address: string;
  draws: number[];
  total: number;
  isActive: boolean;
  hasSkippedTurn: boolean;
  color: string;
  claimed: boolean;
}

export type GameModeType = 'Rounds' | 'TimeBased';

export type GameStatusType = 'NotStarted' | 'InProgress' | 'Ended';

export type ContractRoomTypeWithoutStatusAndMode = {
  creator: string;
  maxNumber: number;
  entryFee: number;
  players: string[];
  isActive: boolean;
  roundValue: number;
  roundCurrentValue: number;
  startTime: number;
  duration: number;
  currentPlayerIndex: number;
  lastTurnTimestamp: number;
  turnTimeout: number;
};

export interface ContractRoomType extends ContractRoomTypeWithoutStatusAndMode {
  id: number;
  status: number;
  mode: number;
}

export interface RoomType extends ContractRoomTypeWithoutStatusAndMode {
  id: string;
  name: string;
  status: GameStatusType;
  mode: GameModeType;
}

export interface GameType {
  roomId: number;
  players: PlayerType[];
  winner: string;
}

export interface RecentActivity {
  type: string;
  text: string;
  timestamp: number;
}

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export type EthersProvider =
  | ethers.BrowserProvider
  | ethers.AbstractProvider
  | undefined;

