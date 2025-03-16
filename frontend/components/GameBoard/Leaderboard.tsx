import React, { useMemo } from "react";
import { Card } from "../ui/card";
import { useGame } from "@/context/GameContext";
import { truncateAddress } from "@/lib/utils";
import PlayerAvatar from "../StartScreens/PlayerAvatar";

const Leaderboard = () => {
  const {players, roomData} = useGame();
  
  if (!roomData) return null;
  
  return (
    <Card className={"flex flex-col gap-3 px-4 py-2"}>
      <h4 className={"text-lg font-bold"}>Leaderboard</h4>

      {/* // TODO: Player scores for each round */}
      {players.sort((a, b) => a.total-b.total).map((player, index) => {
        const playerIsCurrent = player.address === roomData.currentPlayerAddress;

        return (
          <div
            key={player.address}
            className={
              "flex flex-col rounded-xl p-2 gap-2 border border-gray-200 bg-gray-100" +
              (playerIsCurrent ? "bg-gray-200 border-l-4 border-black" : "")
            }
          >
            <div className={"flex items-center gap-2"}>
              <p
                className={
                  "font-bold text-lg" +
                  (playerIsCurrent ? "text-black" : "text-gray-500")
                }
              >
                {index + 1}
              </p>
              <PlayerAvatar />
              <div className={"flex flex-col"}>
                <p className={"text-sm"}>{truncateAddress( player.address)}</p>
              </div>

              <p className={"font-bold text-lg"}>{player.total}</p>
            </div>
          </div>
        );
      })}
    </Card>
  );
};

export default Leaderboard;
