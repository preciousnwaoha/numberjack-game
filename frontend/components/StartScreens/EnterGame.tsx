"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateRoom from "./CreateRoom";
import Lobby from "./Lobby";
import { useGame } from "@/context/GameContext";
import GameBoard from "../GameBoard/GameBoard";
import JoinRoom from "./JoinRoom";

type View = "enterGame" | "createRoom" | "joinRoom";

const EnterGame: React.FC = () => {
  const { roomData } = useGame();
  const [view, setView] = useState<View>("enterGame");

  const handleChangeView = (view: View) => {
    setView(view);
  };

  if (roomData) {
    if (roomData.started) {
      return <GameBoard />;
    }
    return <Lobby />;
  }

  if (view === "createRoom") {
    return <CreateRoom />;
  }

  if (view === "joinRoom") {
    return <JoinRoom />;
  }

  return (
    <div className={""}>
      <Button variant="outline" onClick={() => handleChangeView("createRoom")}>
        Create Room
      </Button>

      <Button variant="outline" onClick={() => handleChangeView("joinRoom")}>
        Join Room
      </Button>
    </div>
  );
};

export default EnterGame;
