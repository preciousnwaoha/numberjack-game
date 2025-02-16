import { PlayerType, RoomType } from "@/types"

export const RANDOM_GOOFY_NAMES = ["beast", "artic", "burn"]

export const SERVER_URL = "http://localhost:5000"


export const MIN_FEE = 0.0001


export const DUMMY_PLAYERS: PlayerType[] = [
    {
        name: "Player 1",
        address: "0x123",
        isComputer: false,
        cards: [],
        total: 0,
        isActive: true,
        hasSkippedTurn: false,
        color: "red",
    },
    {
        name: "Player 2",
        address: "0x456",
        isComputer: false,
        cards: [],
        total: 0,
        isActive: true,
        hasSkippedTurn: false,
        color: "blue",
    },
    {
        name: "Player 3",
        address: "0x789",
        isComputer: true,
        cards: [],
        total: 0,
        isActive: true,
        hasSkippedTurn: false,
        color: "green",
    },
    {
        name: "Player 4",
        address: "0x101",
        isComputer: false,
        cards: [],
        total: 0,
        isActive: true,
        hasSkippedTurn: false,
        color: "yellow",
    },
]


export const DUMMY_ROOM: RoomType = {
    creator: "0x123",
    name: "Some Name",
    id: 1,
    players: 4,
    mode: "rounds",
    modeValue: 3,
    maxNumber: 21,
    drainMode: false,
    drainValue: 0,
    started: false,
    fee: MIN_FEE,
}