export interface PlayerType {
  name: string;
  address: string,
  isComputer: boolean;
  cards: number[];
  total: number;
  isActive: boolean;
  hasSkippedTurn: boolean;
  color: string;
}

export type GameModeType = "rounds" | "timed";

export interface RoomType {
  creator: string; // address of creatoe
  name: string;
  id: number;
  players: number; // Number of players expected when creating room
  mode: GameModeType;
  modeValue: number;
  maxNumber: number;
  drainMode: boolean;
  drainValue: number;
  started: boolean;
  fee: number;
}


export interface GameType {
  roomId: number,
  players: PlayerType[],
  winner: string,
}