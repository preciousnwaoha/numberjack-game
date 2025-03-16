import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { truncateAddress } from "@/lib/utils";
import PlayerAvatar from "../StartScreens/PlayerAvatar";

const ActivePlayers = () => {
  const {players, roomData} = useGame();


  if (!roomData) return null;

  return (
    <Card className={"flex flex-col gap-3 px-4 py-2"}>
      <h4 className={"text-lg font-bold"}>Active Players</h4>
      {players.map((player, index) => {
        const playerIsCurrent = player.address === roomData.currentPlayerAddress;

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
                <PlayerAvatar />
                <div className={"flex flex-col"}>
                  <p className={""}>{truncateAddress( player.address)}</p>
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
