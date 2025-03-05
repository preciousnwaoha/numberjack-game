import React from "react";
import { Card } from "../ui/card";

interface TextMainCardProps {
  text: string;
  main: string;
}

const TextMainCard = ({ text, main }: TextMainCardProps) => {
  return (
    <Card className="inline-flex justify-between space-x-2 px-4 py-2">
      <span className="capitalize text-gray-500 ">{text}</span>
      <span>{main}</span>
    </Card>
  );
};

export default TextMainCard;
