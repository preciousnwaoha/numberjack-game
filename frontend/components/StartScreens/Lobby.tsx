"use client";

import type React from "react";
import styles from "./Lobby.module.css";
import { Button } from "@/components/ui/button";

const Lobby: React.FC = () => {
  return (
    <div className={styles.lobby}>
      <Button variant="outline">Back</Button>
      
    </div>
  );
};

export default Lobby;
