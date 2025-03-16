"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { Card } from "../ui/card";
import PlayerAvatar from "./PlayerAvatar";
import { truncateAddress } from "@/lib/utils";
import Chat from "./Chat";
import Header from "./Header";

interface LobbyProps {
  onBack?: () => void;
}

const Lobby: React.FC<LobbyProps> = ({}) => {
  const { clientPlayerAddress, players, roomData, startGame, } = useGame();

  if (!roomData) {
    return null;
  }

  const creatorIsClient =
    clientPlayerAddress.toLowerCase() === roomData.creator.toLowerCase();

  const roomInfo = {
    "Room Code": `#${roomData.id}`,
    "Game Mode": roomData.mode,
    "No of Rounds": roomData.roundValue,
    "Max Number": roomData.maxNumber,
  };

  return (
    <div className={"h-[100%] min-h-screen p-4 flex flex-col gap-4"}>
      <Header />

      

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="flex flex-col items-center gap-4 p-4 col-span-12 md:col-span-8 relative">
        {/* <Button variant="outline" className="self-start absolute ">Leave</Button> */}

          <div className="w-16 h-16 flex flex-col justify-center items-center text-center bg-gray-200 rounded-full">
            <p className="text-xl font-bold">{players.length}</p>
            <p className="text-xs font-semibold">Joined</p>
          </div>
          <h2>Waiting for players</h2>

          <div className={"flex flex-wrap gap-4"}>
            {players.map((player, i) => (
              <div
                key={i}
                className={
                  "flex flex-col items-center bg-gray-200 p-2 px-4 rounded-lg flex gap-2"
                }
              >
                <PlayerAvatar />

                <p className="text-sm">{truncateAddress(player.address)}</p>

                <p className="text-xs text-green-500">Ready</p>
              </div>
            ))}
          </div>

          {creatorIsClient && players.length > 1 && (
            <Button
              onClick={() => {
                startGame();
              }}
            >
              Start Game
            </Button>
          )}
        </Card>

        <div className="col-span-12 md:col-span-4 grid gap-4">
          <Card className="p-4 flex flex-col gap-2">
            <h3 className="font-bold">Room Information</h3>

            {Object.entries(roomInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <p
                  className="text-gray-500 text-sm font-bold
              "
                >
                  {key}
                </p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </Card>

          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Lobby;
