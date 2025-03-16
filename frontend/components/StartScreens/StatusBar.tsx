import React from "react";
import { Card } from "../ui/card";
import { useGame } from "@/context/GameContext";

const StatusBar = () => {
  const {  clientPlayerBalance, availableRooms } =
    useGame();

  const playersOnline = availableRooms.reduce((acc, room) => {
    return acc + room.players.length;
  }, 0);

  return (
    <>
      <div className="h-[100px]"></div>
      <Card className="flex justify-between p-4 fixed bottom-4 left-4 w-[calc(100%-32px)] ">
        <div className="flex flex-col">
          <p className="text-xl font-bold">{clientPlayerBalance}</p>
          <div>COOR is your Balance</div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-xl font-bold">00{playersOnline}</p>

          <div> {playersOnline > 1 ? "players" : "player"} online</div>
        </div>
      </Card>
    </>
  );
};

export default StatusBar;
