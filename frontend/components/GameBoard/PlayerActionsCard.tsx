import React from "react";
import { Card } from "../ui/card";
import { DUMMY_PLAYERS } from "@/lib/dummy";
import { BsSkipForwardCircleFill } from "react-icons/bs";
import { ImDice } from "react-icons/im";
import { Button } from "../ui/button";
import { TIME_TO_PLAY } from "@/lib/constants";

const PlayerActionsCard = () => {
  const player = DUMMY_PLAYERS[0];
  const [count, setCount] = React.useState(TIME_TO_PLAY);

  const last2Draws =
    player.draws && player.draws.length > 1 ? player.draws.slice(-2) : [0, 0];

  return (
    <Card className={"flex flex-col items-center gap-6 px-4 py-4"}>
      <div className={"flex flex-col items-center gap-2"}>
        <h6>Time remaining</h6>
        <p>00:00</p>
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

      <div className={"flex flex-col gap-4 md:flex-row"}>
        <Button className={""}>
          <ImDice className={"inline"} />
          Draw number
        </Button>

        <Button className={""}>
          <BsSkipForwardCircleFill className={"inline"} />
          Skip turn
        </Button>
      </div>
    </Card>
  );
};

export default PlayerActionsCard;
