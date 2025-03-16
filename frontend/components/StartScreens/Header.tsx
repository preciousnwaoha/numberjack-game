"use client";

import type React from "react";
import { useGame } from "@/context/GameContext";
import Logo from "../ui/Logo";
import { truncateAddress } from "@/lib/utils";

interface HeaderProps {
    onBack?: () => void;
    title?: string | React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({title}) => {
  const { clientPlayerAddress, connected } = useGame();

  return (
    <header className="flex justify-between items-center p-4">
      <Logo />
        {title && <h1 className="text-xl font-bold">{title}</h1>}

      <div className="flex gap-4 items-center">
        {connected && <div>{truncateAddress(clientPlayerAddress)}</div>}

        <div className="flex gap-1 justify-between items-center">
          <div key={`${connected}-indicator`} className={`w-4 h-4 block rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}></div>
          <p>{connected ? "Connected" : "Not connected"}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
