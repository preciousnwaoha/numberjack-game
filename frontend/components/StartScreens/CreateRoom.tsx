"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/context/GameContext";
import { GameModeType } from "@/types";
import { MIN_FEE } from "@/lib/constants";
import { GoArrowLeft } from "react-icons/go";
import Logo from "../ui/Logo";
import { Card } from "../ui/card";
import RoomSettingsInput from "./RoomSettingsInput";

interface CreateRoomProps {
  onBack: () => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onBack }) => {
  const { createRoom, error } = useGame();
  const [players, setPlayers] = useState(2);
  const [maxNumber, setMaxNumber] = useState(21);
  const [mode, setMode] = useState<GameModeType>("Rounds");
  const [modeValue, setModeValue] = useState(3);
  const [fee, setFee] = useState(MIN_FEE);

  const handleCreateRoom = () => {
    if (!players || !maxNumber) {
      return;
    }

    createRoom({
      maxNumber,
      entryFee: fee,
      modeValue,
      mode,
    });
  };

  return (
    <div className={"bg-gray-100 p-4 flex flex-col gap-4"}>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => onBack()}>
          <GoArrowLeft className={"inline"} />
        </Button>

        <Logo />

        <h1 className={"text-2xl font-bold"}>Create a Room</h1>
      </div>

      {/* <Card className="flex flex-col gap-4 p-4">
        <h3>Notable information</h3>
        <p></p>
      </Card> */}

      <Card className={"flex flex-col gap-4 p-4 w-[100%] max-w-[540px] mx-auto"}>
        <h2>Room settings</h2>
        {error && <p className={""}>{error}</p>}

        <RoomSettingsInput
          label="Minimum players"
          value={players}
          defaultVal={2}
          setValue={(val) => {
            setPlayers(val);
          }}
          min={2}
          max={8}
        />

        <RoomSettingsInput
          label="Maximum Number"
          value={maxNumber}
          defaultVal={21}
          setValue={(val) => {
            console.log(val);
            setMaxNumber(val)
          }}
          min={21}
          max={100}
        />

        <div className="flex flex-col gap-2">
          <label>Game Mode</label>
          <div className="flex gap-4">
            <button
              onClick={() => setMode("Rounds")}
              className={`px-4 py-2 rounded-md bg-gray-100 ${
                mode === "Rounds" ? "bg-black text-white" : ""
              }`}
            >
              Fixed Rounds
            </button>

            <button
              onClick={() => setMode("TimeBased")}
              className={mode === "TimeBased" ? "bg-gray-200" : ""}
            >
              Fixed Time
            </button>
          </div>
        </div>

        <RoomSettingsInput
          label={mode === "Rounds" ? "Rounds" : "Minutes"}
          value={modeValue}
          defaultVal={3}
          setValue={(val) => setModeValue(val)}
          min={3}
          max={9}
        />

        <div className="flex gap-2 items-center">
          <Input
          className="w-24 text-center"
            type="number"
            value={fee}
            min={MIN_FEE}
            max={1}
            onChange={(e) => setFee(Number(e.target.value))}
          />
          <label>Fee</label>
        </div>

        <Button onClick={handleCreateRoom}>Create Room</Button>
      </Card>
    </div>
  );
};

export default CreateRoom;
