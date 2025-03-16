import React from "react";
import { Card } from "../ui/card";
import { useGame } from "@/context/GameContext";

const StatusBar = () => {
  const { clientPlayerAddress, clientPlayerBalance, availableRooms } =
    useGame();

  const playersOnline = availableRooms.reduce((acc, room) => {
    return acc + room.players.length;
  }, 0);

  return (
    <Card className="flex justify-between p-4" >
      <div>
        <div>{clientPlayerAddress}</div>

        <div>{clientPlayerBalance}</div>
      </div>

      <div>
        <div>Connected</div>

        <div>{playersOnline} players online</div>
      </div>
    </Card>
  );
};

export default StatusBar;
