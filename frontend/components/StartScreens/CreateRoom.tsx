"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useGame } from "@/context/GameContext";
import { Select } from "../ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { GameModeType } from "@/types";
import { MIN_FEE } from "@/lib/constants";

const CreateRoom: React.FC = () => {
  const { createRoom, clientPlayerAddress, error } = useGame();
  const [roomName, setRoomName] = useState("Some Name");
  const [players, setPlayers] = useState(2);
  const [maxNumber, setMaxNumber] = useState(21);
  const [mode, setMode] = useState<GameModeType>("rounds");
  const [modeValue, setModeValue] = useState(3);
  const [fee, setFee] = useState(MIN_FEE);

  const handleCreateRoom = () => {
    if (!roomName || !players || !maxNumber) {
      return;
    }

    createRoom({
      creator: clientPlayerAddress,
      name: roomName,
      id: 1,
      players,
      mode,
      modeValue,
      maxNumber,
      drainMode: false,
      drainValue: 0,
      started: false,
      fee,
    });
  };

  return (
    <div className={""}>
      <Button variant="outline">Back</Button>
      <div className={""}>
        <h2>Create a Room</h2>
        {error && <p className={""}>{error}</p>}
        <label>Room Name</label>
        <Input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />

        <label>Number of Players</label>
        <Input
          type="number"
          min="1"
          max="12"
          value={players}
          onChange={(e) => setPlayers(Number(e.target.value))}
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
