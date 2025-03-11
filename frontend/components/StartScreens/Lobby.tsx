"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import Logo from "../ui/Logo";
import { Card } from "../ui/card";

const Lobby: React.FC = () => {
  const { clientPlayerAddress, players, roomData, startGame } = useGame();

  if (!roomData) {
    return null;
  }

  const creatorIsClient = clientPlayerAddress.toLowerCase() === roomData.creator.toLowerCase();

  return (
    <div className={""}>
      <div>
        <Logo />
        <Button variant="outline">Out</Button>
      </div>

      <div className="">
        <Card>
          <h2>Waiting Room</h2>
          <p>{players.length} Players joined</p>

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
        </Card>

        <Card>
          <h3>Room Information</h3>

          <div>
            <p>Room Details</p>
            <p>
              {roomData.id} - {roomData.name}
            </p>
          </div>

          <div>
            <p>Game Mode</p>
            <p>{roomData.mode}</p>
            <p>{roomData.roundValue}</p>
          </div>

          <div>
            <p> No of Rounds</p>
            <p>{roomData.roundValue}</p>
          </div>

          <div>
            <p>Max Number</p>
            <p>{roomData.maxNumber}</p>
          </div>
        </Card>

        <Card>
          <h3>Players</h3>
          {players.map((player, i) => (
            <div key={i} className={""}>
              <div
                className={""}
                style={{ backgroundColor: player.color }}
              ></div>
              <p>{player.address}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Lobby;
