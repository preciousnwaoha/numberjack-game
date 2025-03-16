"use client";

import type React from "react";
import { useGame } from "@/context/GameContext";

const Footer: React.FC = () => {
  const { clientPlayerAddress, connected } = useGame();



  return (
   
      <footer>

        {connected && <div>
            {clientPlayerAddress}
                </div>}

        <div className="flex justify-between">
          <div>Active players</div>
          <div>Network Connected</div>
        </div>
      </footer>
  );
};

export default Footer;
