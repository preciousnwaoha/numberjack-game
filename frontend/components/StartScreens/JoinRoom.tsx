"use client";

import React, { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import StatusBar from "./StatusBar";
import Header from "./Header";
import JoinRoomItem from "./JoinRoomItem";

interface JoinRoomProps {
  onBack?: () => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({
  onBack,
}) => {
  const { joinRoom, availableRooms, error, loading, getAvailableRooms } =
    useGame();

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
    <div className={"h-[100%] min-h-screen bg-gray-100 p-4 flex flex-col gap-4"}>
      <Header title={"Available rooms"} />

      <div>
        <Button onClick={onBack}>Back</Button>
      </div>
      
      {!loading && (
        <ul className="grid gap-4 md:grid-cols-3">
          {availableRooms.map((room, index) => {
            return (
              <JoinRoomItem 
                key={index} 
                room={room} 
                handleJoinRoom={handleJoinRoom}
              />
            );
          })}
        </ul>
      )}

      {loading && <p className="text-center">Loading...</p>}

      {error && <p className="text-center">{error}</p>}

      {availableRooms.length === 0 && !loading && (
        <p className="text-center">No available rooms</p>
      )}

      {/* <Card className={"flex flex-col gap-4 p-4"}>
        <p>
          <span>Pro Tip:</span>
          Watch the timer carefully in timed mode! Quick decisions often lead to
          better results.
        </p>
      </Card> */}

      <StatusBar />
    </div>
  );
};

export default JoinRoom;
