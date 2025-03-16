"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
// import { RiComputerLine } from "react-icons/ri";
// import { RiRobot2Line } from "react-icons/ri";
// import { FaUserAstronaut } from "react-icons/fa6";
import { useGame } from "@/context/GameContext";
import { PlayerType } from "@/types";

interface PlayerCardProps {
  player: PlayerType;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const { drawCard, skipTurn, roomData } = useGame();

  if (!player || !roomData) return


  const isCurrentPlayer = player.address === roomData.currentPlayerAddress;
  
  const { color } = player;

  const draws1 = player.draws.filter((_, i) => i % 2 === 0);
  const draws2 = player.draws.filter((_, i) => i % 2 !== 0);

  const sumOfDraws1 = draws1.reduce((acc, curr) => acc + curr, 0);
  const sumOfDraws2 = draws2.reduce((acc, curr) => acc + curr, 0);

  const noOfDraws = !!player.draws ? player.draws.length / 2 : 0;

  const handleDrawCard = () => {
    drawCard();
  }  

  const handleSkipTurn = () => {
    skipTurn();
  }



  return (
    <Card>
      <CardHeader>
        <div>
          <div style={{ "--player-color": color } as React.CSSProperties}>
            {/* <div>{isComputer ? <RiComputerLine /> : <FaUserAstronaut />}</div> */}
          </div>
          <span className="font-bold">Player {player.address}</span>
          <div className={``}>Draws: {noOfDraws}</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`text-sm `}>{sumOfDraws1}</div>
        <div className={`text-sm `}>{sumOfDraws2}</div>

        <div>Sum of draws: {player.total}</div>

        {!player.isActive && (
          <div className={`text-red-500 mt-2 `}>Out of the game</div>
        )}
      </CardContent>

      {isCurrentPlayer && (
        <CardFooter className={""}>
          <Button onClick={handleDrawCard}>Draw card</Button>
          {!player.hasSkippedTurn && <Button variant="outline" onClick={handleSkipTurn}>
            Skip
          </Button>}
        </CardFooter>
      )}
    </Card>
  );
};

export default PlayerCard;
