import React from "react";
import { Card } from "../ui/card";

interface GameProgressProps {
  progress: number;
  of: number;
  text: string;
  subtext: string;
}

const GameProgress = ({ progress, of, text, subtext }: GameProgressProps) => {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold">{text}</p>
        <p className="text-sm text-gray-500">{subtext}</p>
      </div>

      <div className="w-full bg-gray-200 rounded-full">
        <div
          className="bg-black h-2 rounded-full"
          style={{ width: `${(progress / of) * 100}%` }}
        ></div>
      </div>
    </Card>
  );
};

export default GameProgress;
