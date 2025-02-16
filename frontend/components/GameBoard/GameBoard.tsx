"use client";

import type React from "react";
import Header from "../Header";
import ThemeToggle from "../ThemeToggle";
import AboutModal from "../AboutModal";
import Scoreboard from "../Scoreboard";
import PlayerCard from "./PlayerCard";
import GameControls from "../GameControls";
import NotificationBar from "../NotificationBar";
import { useGame } from "@/context/GameContext";
import { DUMMY_PLAYERS } from "@/lib/constants";

const GameBoard: React.FC = () => {
  const { gameRound, players } = useGame();

  return (
    <div className={"container grid gap-4 "}>
      {Array.from({ length: players.length }, (_, i) => (
        <PlayerCard key={i} player={players[i]} />
      ))}
    </div>
  );
};

export default GameBoard;
