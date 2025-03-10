"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Lobby from "./Lobby";
import { useGame } from "@/context/GameContext";
import GameBoard from "../GameBoard/GameBoard";
import JoinRoom from "./JoinRoom";
import Logo from "../ui/Logo";
import Footer from "./Footer";
import CreateRoom from "./CreateRoom";

type View = "enterGame" | "createRoom" | "joinRoom";

const EnterGame: React.FC = () => {
  const { roomData, connect, } = useGame();
  const [view, setView] = useState<View>("enterGame");

  const handleChangeView = (view: View) => {
    setView(view);
  };

  if (roomData) {
    if (roomData.status === "InProgress") {
      return <GameBoard />;
    }
    return <Lobby />;
  }

  if (view === "createRoom") {
    return <CreateRoom 
      onBack={() => handleChangeView("enterGame")}
    />;
  }

  if (view === "joinRoom") {
    return <JoinRoom />;
  }

  return (
    <div className={"H-screen flex flex-col justify-center items-center gap-4"}>
      <Logo />

      <p className={"text-3xl"}>Draw your luck and earn your stack!</p>

      <div className="w-2/3 bg-gray-100 p-4 rounded-lg flex flex-col gap-4 items-center relative">
        <img
          src="https://via.placeholder.com/150"
          alt="placeholder"
          className="absolute top-0 right-0"
        />

        <div>
          <Button
            variant="outline"
            onClick={() => handleChangeView("createRoom")}
          >
            Create Room
          </Button>

          <Button
            variant="outline"
            onClick={() => handleChangeView("joinRoom")}
          >
            Join Room
          </Button>
        </div>

        <div>
          <h4>How to play?</h4>
          <p>
            Draw numbers, stay under the max, outsmart your <b />
            opponents! Each turn, draw two numbers and <b />
            strategically avoid exceeding the maximum value.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnterGame;
