import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useMemo } from "react";
import { useGame } from "@/context/GameContext";

const ActivePlayers = () => {
  const {players} = useGame();
  const currentPlayerIndex = 0;

  const seed = useMemo(() => Math.random().toString(36).substring(2, 10), []);
  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;

  return (
    <Card className={"flex flex-col gap-3 px-4 py-2"}>
      <h4 className={"text-lg font-bold"}>Active Players</h4>
      {players.map((player, index) => {
        const playerIsCurrent = currentPlayerIndex === index;

        const playerStatus = !player.isActive
          ? "bust"
          : player.hasSkippedTurn
          ? "skipped"
          : "active";

        const playerStatusColor =
          playerStatus === "bust"
            ? "text-red-500"
            : playerStatus === "skipped"
            ? "text-yellow-500"
            : "text-green-500";

        return (
          <div
            key={player.address}
            className={
              "flex flex-col rounded-xl p-2 gap-2 border border-gray-200" +
              (playerIsCurrent ? "bg-gray-100 border-l-4 border-black" : "")
            }
          >
            <div className={"flex items-center gap-2 justify-between"}>
              <div className={"flex items-center gap-2"}>
                <Avatar>
                  <AvatarImage src={avatarUrl} alt={player.name} />
                  <AvatarFallback>XX</AvatarFallback>
                </Avatar>
                <div className={"flex flex-col"}>
                  <p className={""}>{player.address}</p>
                  <p className={`${playerStatusColor}`}>{playerStatus}</p>
                </div>
              </div>

              <p className={"font-bold text-lg"}>{player.total}</p>
            </div>

            {playerIsCurrent && (
              <div className={"inline-flex bg-gray-100 px-2 py-1 rounded-md"}>
                Current Turn
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
};

export default ActivePlayers;
