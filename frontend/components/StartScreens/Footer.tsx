"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

const Footer: React.FC = () => {
  const { connect, clientPlayerAddress, connected } = useGame();



  return (
   
      <footer>
        {!connected && <Button onClick={() => {
          connect();
        }} variant="outline">
          Connect Wallet
        </Button>}

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
