import { PlayerType } from "@/types";
// import { generate } from "cool-name-generator";

// const genName = generate({ words: 2 });

export const genRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}


export const checkWinner = (scores: number[], maxNumber: number) => {};

export const currentPlayerIsClient = ({

}: {
  players: PlayerType[];
  currentPlayer: number;
  clientPlayer: string;
}) => {};
