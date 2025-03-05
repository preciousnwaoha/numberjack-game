export interface PlayerType {
  name: string;
  address: string;
  draws: number[];
  total: number;
  isActive: boolean;
  hasSkippedTurn: boolean;
  color: string;
}

export type GameModeType = 'Rounds' | 'TimeBased';

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
  status: 'NotStarted' | 'InProgress' | 'Ended';
  started: boolean;
  entryFee: number;
  startTime: number;
  duration: number;
  currentPlayerIndex: number;
  lastTurnTimestamp: number;
  turnTimeout: number;
}

export interface GameType {
  roomId: number;
  players: PlayerType[];
  winner: string;
}
