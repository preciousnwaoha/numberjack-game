"use client";

import type React from "react";
import { useState } from "react";
import styles from "./EnterGame.module.css";
import { Button } from "@/components/ui/button";
import CreateRoom from "./CreateRoom";
import Lobby from "./Lobby";

type View = "enterGame" | "createRoom" | "joinRoom";

const EnterGame: React.FC = () => {
  const [view, setView] = useState<View>("enterGame");

  const handleChangeView = (view: View) => {
    setView(view);
  };

  if (view === "createRoom") {
    return <CreateRoom />;
  }

  if (view === "joinRoom") {
    return <Lobby />;
  }

  return (
    <div className={styles.enterGame}>
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
