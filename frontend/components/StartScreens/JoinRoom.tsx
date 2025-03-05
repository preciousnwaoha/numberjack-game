"use client";

import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import { RoomType } from "@/types";

const JoinRoom: React.FC = () => {
  const { joinRoom, clientPlayerAddress, error } = useGame();
  const [availableRooms, setAvailableRooms] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  useEffect(() => {
    const getAvailableRooms = () => {
        // get available rooms from chain in realtime
    }

    getAvailableRooms();
  }, []);


  const handleJoinRoom = () => {
    joinRoom(selectedRoom);
  };

  return <div className={""}>
    <h1>Join Room</h1>
    {
        availableRooms.map((room) => {
            return <div key={room.id}>
            <p>{room.name}</p>
            <p>{room.players} players</p>
            <p>{room.mode} mode</p>
            <p>{room.maxNumber} max number</p>
            <p>{room.fee} fee</p>

            </div>
        })
    }

    <Button onClick={handleJoinRoom}>Join Room</Button>
    {error && <p>{ error }</p>}

  </div>;
};

export default JoinRoom;
