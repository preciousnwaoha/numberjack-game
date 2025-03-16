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
import ThreeBackground from "./ThreeBackground";

type View = "enterGame" | "createRoom" | "joinRoom";

const EnterGame: React.FC = () => {
  const { roomData, loading, players, connect, connected } = useGame();
  const [view, setView] = useState<View>("enterGame");

  const handleChangeView = (view: View) => {
    setView(view);
  };

  console.log("roomData", roomData);

  if (roomData) {
    if (roomData.status === "InProgress" && players.length > 1) {
      return <GameBoard />;
    }
    return <Lobby onBack={() => handleChangeView("enterGame")} />;
  }

  if (view === "createRoom") {
    return <CreateRoom onBack={() => handleChangeView("enterGame")} />;
  }

  if (view === "joinRoom") {
    return <JoinRoom onBack={() => handleChangeView("enterGame")} />;
  }

  return (
    <div
      className={
        "h-screen bg-[#111827] flex flex-col items-center gap-4 p-4 relative"
      }
    >
      <ThreeBackground />
      <Logo />

      <p className={"text-sm text-white"}>
        Draw your luck and earn your stack!
      </p>

      <div className="w-[100%] h-[100%] md:max-w-2/3 p-4 flex flex-col gap-4 items-center relative border border-[#374151] rounded-3xl">
        {!loading && (
          <div>
            {!connected && (
              <Button
                variant="outline"
                onClick={() => {
                  connect();
                }}
              >
                Connect Wallet
              </Button>
            )}
            {connected && (
              <>
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
              </>
            )}
          </div>
        )}

        {loading && <p className="text-white">{loading}</p>}

        <div className="text-white text-center">
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
