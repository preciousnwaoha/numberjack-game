import { PlayerType, RoomType } from "@/types";
import { MIN_FEE } from "./constants";

export const DUMMY_RECENT_ACTIVITIES = [
  {
    type: "draw",
    text: "0x8f23 drew 7 and 5",
  },
  {
    type: "skip",
    text: "0x3f56 skipped their turn",
  },
  {
    type: "bust",
    text: "0x7a12 went bust with 23",
  },
];

export const DUMMY_PLAYERS: PlayerType[] = [
  {
    name: "Player 1",
    address: "0x123",

    draws: [],
    total: 0,
    isActive: true,
    hasSkippedTurn: false,
    claimed: false,
    color: "red",
  },
  {
    name: "Player 2",
    address: "0x456",

    draws: [],
    total: 0,
    isActive: true,
    hasSkippedTurn: false,
    claimed: false,
    color: "blue",
  },
  {
    name: "Player 3",
    address: "0x789",
    draws: [],
    total: 0,
    isActive: true,
    hasSkippedTurn: false,
    claimed: false,
    color: "green",
  },
  {
    name: "Player 4",
    address: "0x101",

    draws: [],
    total: 0,
    isActive: true,
    hasSkippedTurn: false,
    claimed: false,
    color: "yellow",
  },
];

export const DEFAULT_ROOM: RoomType = {
  creator: "",
  name: "",
  id: 0,
  players: [],
  mode: "Rounds",
  modeValue: 3,
  maxNumber: 21,
  modeCurrentValue: 0,
  isActive: false,
  status: "NotStarted",
  entryFee: MIN_FEE,
  startTime: 0,
  duration: 0,
  currentPlayerIndex: 0,
  lastTurnTimestamp: 0,
  turnTimeout: 0,
};

export const DUMMY_ROOM: RoomType = {
  creator: "0x123",
  name: "Some Name",
  id: 1,
  players: DUMMY_PLAYERS.map((p) => p.address),
  mode: "Rounds",
  modeValue: 3,
  modeCurrentValue: 0,
  maxNumber: 21,
  isActive: true,
  status: "NotStarted",
  entryFee: MIN_FEE,
  startTime: 0,
  duration: 0,
  currentPlayerIndex: 0,
  lastTurnTimestamp: 0,
  turnTimeout: 0,
};
