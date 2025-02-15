
"use client";

// Name
// Number of players
// Add Computers
// Auto Fill Up with mods after?
// Max Number
// Fixed Rounds mode | (Fixed Time mode)
// (Drain mode)

import React, { useState } from "react";
import styles from "./CreateRoom.module.css";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import { useGame } from "@/context/GameContext";
import { Select } from "../ui/select";
import { SelectItem } from "@radix-ui/react-select";

const CreateRoom: React.FC = () => {
  const { startGame, error } = useGame();
  const [roomName, setRoomName] = useState("");
  const [humanPlayers, setHumanPlayers] = useState(2);
  const [computerPlayers, setComputerPlayers] = useState(0);
  const [maxNumber, setMaxNumber] = useState(50);
  const [autoFill, setAutoFill] = useState(false);
  const [gameMode, setGameMode] = useState("fixed-rounds");

  const handleCreateRoom = () => {
    startGame(humanPlayers, computerPlayers, maxNumber);
  };

  return (
    <div className={styles.createRoom}>
      <Button variant="outline">Back</Button>
      <div className={styles.formContainer}>
        <h2>Create a Room</h2>
        {error && <p className={styles.error}>{error}</p>}
        <label>Room Name</label>
        <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Enter room name" />
        
        <label>Number of Human Players</label>
        <Input
          type="number"
          min="1"
          max="12"
          value={humanPlayers}
          onChange={(e) => setHumanPlayers(Number(e.target.value))}
        />

        <label>Number of Computer Players</label>
        <Input
          type="number"
          min="0"
          max="12"
          value={computerPlayers}
          onChange={(e) => setComputerPlayers(Number(e.target.value))}
        />

        <label>Max Number</label>
        <Input
          type="number"
          min="21"
          max="100"
          value={maxNumber}
          onChange={(e) => setMaxNumber(Number(e.target.value))}
        />

        {/* <Checkbox checked={autoFill} onCheckedChange={setAutoFill}>Auto-fill with Mods</Checkbox> */}
        
        {/* <label>Game Mode</label> */}
        {/* <Select value={gameMode} onValueChange={setGameMode}>
          <SelectItem value="fixed-rounds">Fixed Rounds Mode</SelectItem>
          <SelectItem value="fixed-time">Fixed Time Mode</SelectItem>
          <SelectItem value="drain">Drain Mode</SelectItem>
        </Select> */}

        <Button onClick={handleCreateRoom}>Create Room</Button>
      </div>
    </div>
  );
};

export default CreateRoom;
