import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoomSettingsInputProps {
  label: string;
  value: number;
  defaultVal: number;
  setValue: (value: number) => void;
  max: number;
  min: number;
}

const RoomSettingsInput = ({
  label,
  value,
  defaultVal,
  setValue,
  max,
  min,
}: RoomSettingsInputProps) => {
  // Decrement the value while ensuring it doesn't go below min
  const handleDecrement = () => {
    if (value > min) {
      setValue(value - 1);
    }
  };

  // Increment the value while ensuring it doesn't exceed max
  const handleIncrement = () => {
    if (value < max) {
      setValue(value + 1);
    }
  };

  // Handle manual input changes while clamping the value between min and max
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) {
      // Clamp the value between min and max
      const clampedValue = Math.min(Math.max(newValue, min), max);
      setValue(clampedValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label>{label}</label>
      <div className="flex items-center space-x-2">
        <Button onClick={handleDecrement}>-</Button>
        <Input

          className="inline-block text-center w-auto pl-4 pr-2"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
        />
        <Button onClick={handleIncrement}>+</Button>
      </div>
    </div>
  );
};

export default RoomSettingsInput;
