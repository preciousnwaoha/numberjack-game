import React from "react";
import { Card } from "../ui/card";
import { BsSkipForwardCircleFill } from "react-icons/bs";
import { ImDice } from "react-icons/im";
import { Button } from "../ui/button";
import { useGame } from "@/context/GameContext";

const PlayerActionsCard = () => {
  const { players, roomData, clientPlayerAddress } = useGame();
  const [count, setCount] = React.useState(roomData?.turnTimeout || 0);
  const currentPlayerIndex = roomData ? roomData.currentPlayerIndex : null;

  // Reset timer when currentPlayer changes or when the timeout value updates.
  React.useEffect(() => {
    setCount(roomData?.turnTimeout || 0);
  }, [currentPlayerIndex, roomData?.turnTimeout]);

  // Countdown effect: decrease count every second.
  React.useEffect(() => {
    if (count <= 0) return; // Stop countdown if timer reaches 0
    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count]);

  if (!roomData || currentPlayerIndex === null) return null;
  const player = players[currentPlayerIndex];

  const last2Draws =
    player.draws && player.draws.length > 1 ? player.draws.slice(-2) : [0, 0];

  const clientIsPlayer = clientPlayerAddress === player.address;

  // Format seconds into mm:ss.
  const formatTime = (seconds:number ) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Card className={"flex flex-col items-center gap-6 px-4 py-4"}>
      <div className={"flex flex-col items-center gap-2"}>
        <h6>Time remaining</h6>
        <p>{formatTime(count)}</p>
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

      {clientIsPlayer && <div className={"flex flex-col gap-4 md:flex-row"}>
        <Button className={""}>
          <ImDice className={"inline"} />
          Draw number
        </Button>

        <Button className={""}>
          <BsSkipForwardCircleFill className={"inline"} />
          Skip turn
        </Button>
      </div>}
    </Card>
  );
};

export default PlayerActionsCard;
