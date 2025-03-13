import React, { useMemo } from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGame } from "@/context/GameContext";

const Leaderboard = () => {
  const {players} = useGame();
  const currentPlayerIndex = 0;

  const seed = useMemo(() => Math.random().toString(36).substring(2, 10), []);
  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;

  return (
    <Card className={"flex flex-col gap-3 px-4 py-2"}>
      <h4 className={"text-lg font-bold"}>Leaderboard</h4>

      {players.map((player, index) => {
        const playerIsCurrent = currentPlayerIndex === index;

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
              <Avatar>
                <AvatarImage src={avatarUrl} alt={player.name} />
                <AvatarFallback>XX</AvatarFallback>
              </Avatar>
              <div className={"flex flex-col"}>
                <p className={""}>{player.address}</p>
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
