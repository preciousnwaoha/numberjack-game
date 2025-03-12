"use client";

import type React from "react";
import { useGame } from "@/context/GameContext";
import Logo from "../ui/Logo";
import TextMainCard from "./TextMainCard";
import ActivePlayers from "./ActivePlayers";
import Leaderboard from "./Leaderboard";
import RecentActivity from "./RecentActivity";
import PlayerActionsCard from "./PlayerActionsCard";
import GameProgress from "./GameProgress";
import { Button } from "../ui/button";

const GameBoard: React.FC = () => {
  const { endGame, players } = useGame();
  const gameRound = 1;
  const maxRounds = 3;
  const maxNumber = 21;
  const playersRemaining = players.filter((player) => player.isActive).length;

  return (
    <div className={"container relative grid gap-4 bg-gray-100 p-4"}>
      <div className={"flex gap-4"}>
        <Logo />

        <div className={"flex gap-4 items-start"}>
          <TextMainCard text="Round" main={`${gameRound}/${maxRounds}`} />
          <TextMainCard text="Max Number" main={maxNumber.toString()} />
        </div>

        <Button variant="outline" onClick={() => endGame()}>End Game</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Left element - Active Players (3 columns on large screens) */}
        <div className="md:col-span-3">
          <ActivePlayers />
        </div>

        {/* Center element - Player Actions Card (6 columns on large screens) */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <PlayerActionsCard />
          <GameProgress
            progress={gameRound}
            of={maxRounds}
            text="Rounds progress"
            subtext={`${playersRemaining}/${players.length} players remaining`}
          />
        </div>

        {/* Right element - Leaderboard & Recent Activity (3 columns on large screens) */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <Leaderboard />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
