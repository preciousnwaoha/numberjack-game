"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

const Lobby: React.FC = () => {
  const { clientPlayerAddress, players, roomData, startGame } = useGame();

  if (!roomData) {
    return null;
  }

  const creatorIsClient = clientPlayerAddress === roomData.creator;

  return (
    <div className={""}>
      <Button variant="outline">Out</Button>

      <h2>{roomData.name}</h2>
      

      <div className={""}>
        {players.map((player, i) => (
          <div key={i} className={""}>
            <div
              className={""}
              style={{ backgroundColor: player.color }}
            ></div>
            <p>{player.address}</p>
          </div>
        ))}
      </div>

      {creatorIsClient && (
        <Button
          onClick={() => {
            startGame();
          }}
        >
          Start Game
        </Button>
      )}
    </div>
  );
};

export default Lobby;
