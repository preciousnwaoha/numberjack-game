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
const GameBoard: React.FC = () => {
  const { players, roomData } = useGame();

  if (!roomData) return null;


  const gameRound = roomData.roundCurrentValue;
  const maxRounds = roomData.roundValue;
  const maxNumber = roomData.maxNumber;
  const playersRemaining = players.filter((player) => player.isActive).length;

  return (
    <div className={" relative grid gap-4 bg-gray-100 p-4 h-[100%] min-h-screen"}>
      <div className={"flex gap-4"}>
        <Logo />

        <div className={"flex gap-4 items-start"}>
          <TextMainCard text="Round" main={`${gameRound}/${maxRounds}`} />
          <TextMainCard text="Max Number" main={maxNumber.toString()} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Left element - Active Players (3 columns on large screens) */}
        <div className="hidden md:col-span-3 md:block">
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

        <div className="block md:col-span-3 md:hidden w-full">
          <ActivePlayers />
        </div>

        {/* Right element - Leaderboard & Recent Activity (3 columns on large screens) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Leaderboard />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
