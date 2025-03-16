import React from "react";
import { Card } from "../ui/card";
import { BsSkipForwardCircleFill } from "react-icons/bs";
import { ImDice } from "react-icons/im";
import { Button } from "../ui/button";
import { useGame } from "@/context/GameContext";
import { formatTime, truncateAddress } from "@/lib/utils";
const PlayerActionsCard = () => {
  const { players, roomData, clientPlayerAddress, drawCard, skipTurn, forceAdvance } =
    useGame();
  const [count, setCount] = React.useState(roomData?.turnTimeout || 0);
  const currentPlayerAddress = roomData ? roomData.currentPlayerAddress : null;

  // Reset timer when currentPlayer changes or when the timeout value updates.
  React.useEffect(() => {
    setCount(roomData?.turnTimeout || 0);
  }, [currentPlayerAddress, roomData?.turnTimeout]);

  // Countdown effect: decrease count every second.
  React.useEffect(() => {
    if (count <= 0) return; // Stop countdown if timer reaches 0
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count]);

  if (!roomData || currentPlayerAddress === null) return null;
  const player = players.find((p) => p.address === currentPlayerAddress);

  if (!player) return null;

  const last2Draws =
    player.draws && player.draws.length > 1 ? player.draws.slice(-2) : [0, 0];

  const clientIsCurrentPlayer = clientPlayerAddress === currentPlayerAddress;

  const timeoutOccurred = count === 0;

  return (
    <Card className={"flex flex-col items-center gap-6 px-4 py-4"}>
      <div className={"flex flex-col items-center gap-2"}>
        <h6 className={"text-gray-500 text-sm"}>Time remaining</h6>
        <p className="text-3xl font-bold text-center" >
          {formatTime(count)}</p>
      </div>

      <div className={"grid grid-cols-2 gap-4"}>
        {last2Draws.map((draw, index) => (
          <div
            key={index}
            className={
              "flex flex-col justify-center items-center gap-2 col-span-2 md:col-span-1 rounded-md p-4 bg-gray-200"
            }
          >
            <h6 className="text-gray-500">
              {index === 0 ? "First number" : "Second number"}
            </h6>
            <p className="font-bold text-2xl">{draw}</p>
          </div>
        ))}
      </div>

      {clientIsCurrentPlayer && (
        <div className={"flex flex-col gap-4 md:flex-row"}>
          <Button onClick={drawCard}>
            <ImDice className={"inline"} />
            Draw number
          </Button>

          {!timeoutOccurred && <Button onClick={skipTurn}>
            <BsSkipForwardCircleFill className={"inline"} />
            Skip turn
          </Button>}
        </div>
      )}

      {!clientIsCurrentPlayer && timeoutOccurred && (
        <div className={"flex flex-col gap-4 md:flex-row"}>
          <Button onClick={forceAdvance}>
            <ImDice className={"inline"} />
            Force turn for {truncateAddress(player.address)}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PlayerActionsCard;
