"use client";

import React, { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import Logo from "../ui/Logo";
import { Card } from "../ui/card";
import StatusBar from "./StatusBar";

const JoinRoom: React.FC = () => {
  const { joinRoom, availableRooms, error, loading, getAvailableRooms } = useGame();

  useEffect(() => {
    const fetchAvailableRooms = () => {
      // get available rooms from chain in realtime
      getAvailableRooms();
    };

    fetchAvailableRooms();
  }, []);

  const handleJoinRoom = (id: string) => {
    joinRoom(id);
  };

  return (
    <div className={"bg-gray-100 p-4 flex flex-col gap-4"}>
      <div>
        <Logo />
      </div>

      <h1>Join Room</h1>
      {!loading && <ul className="grid gap-4 md:grid-cols-3">
        {availableRooms.map((room, index) => {
          return (
            <Card
              key={index}
              className={"flex flex-col gap-2 p-4 md:col-span-1"}
            >
              <div>
                <p>{room.name || `Game Room # ${room.id}`}</p>
              </div>

              <div>
                <div>
                  <p>{room.players.length} players</p>
                </div>
                <div>
                  <p> Max:{room.maxNumber}</p>
                </div>
                <div>
                  <p>{room.mode}</p>
                </div>
                <div>
                  <p>{room.roundValue}</p>
                </div>
              </div>

              <Button onClick={() => handleJoinRoom(room.id)}>
                Join Room {room.entryFee}
              </Button>
            </Card>
          );
        })}
      </ul>}

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      <Card className={"flex flex-col gap-4 p-4"}>
        <p>
          <span>Pro Tip:</span>
          Watch the timer carefully in timed mode! Quick decisions often lead to
          better results.
        </p>
      </Card>

      <StatusBar />
    </div>
  );
};

export default JoinRoom;
