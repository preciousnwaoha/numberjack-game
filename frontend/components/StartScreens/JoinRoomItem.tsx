import React from "react";
import { Card } from "../ui/card";
import { RoomType } from "@/types";
import { Button } from "../ui/button";
import { FaDice } from "react-icons/fa";
import { FaDiceD20 } from "react-icons/fa6";
import { FaCoins } from "react-icons/fa";
import { FaDiceFive } from "react-icons/fa";
import { FaHashtag } from "react-icons/fa";

interface JoinRoomItemProps {
  room: RoomType;
  handleJoinRoom: (id: string) => void;
  
}

const JoinRoomItem = ({ room, handleJoinRoom }: JoinRoomItemProps) => {
  const entryFee = Number(room.entryFee) / 10 ** 18;
  const info = [
    {
      icon: <FaDiceFive className="text-gray-400 text-sm" />,
      text: "Rounds Mode",
    },
    {
      icon: <FaHashtag className="text-gray-400 text-sm" />,
      text: `Max Number: ${room.maxNumber}`,
    },
    {
      icon: <FaCoins className="text-gray-400 text-sm text-orange-500" />,
      text: `${entryFee} CORE`,
    },
    {
      icon: <FaDiceD20 className="text-gray-400 text-sm" />,
      text: `${room.roundValue} Rounds`,
    },
  ];

  return (
    <Card className={"flex flex-col gap-2 p-4 md:col-span-1"}>
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <FaDice className="text-lg" />
          <p className="font-bold text-lg">{`Game Room #${room.id}`}</p>
        </div>
        <p className="text-sm text-gray-400">
          {room.players.length} player in
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {info.map((item, index) => (
          <div
            key={index}
            className="w-[calc(50%-4px)] flex items-center gap-2"
          >
            {item.icon}
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <Button onClick={() => handleJoinRoom(room.id)}>
        Join Room ({entryFee} CORE)
      </Button>
    </Card>
  );
};

export default JoinRoomItem;
