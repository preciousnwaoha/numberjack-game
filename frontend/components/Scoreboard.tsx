"use client";

import type React from "react";
import { useState } from "react";
import styles from "./Scoreboard.module.css";
import { useGame } from "@/context/GameContext";

const Scoreboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scores } = useGame();


  return (
    <>
      <>
        <button
          className={styles.seeScoreboard}
          onClick={() => setIsOpen(true)}
        >
          Show Scoreboard
        </button>
        {isOpen && (
          <div className={styles.scoreboardWrapper}>
            <div className={styles.scoreboard}>
              <h2 className={styles.scoreboardHeader}>Scoreboard</h2>
              <ul className={styles.scoreboardList}>
                {scores.map((score, index) => (
                  <li key={index} className={styles.scoreboardListItem}>
                    <span>{index + 1}</span>Player {index + 1}: {score}
                  </li>
                ))}
              </ul>
              <button
                className={styles.scoreboardExit}
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </>
    </>
  );
};

export default Scoreboard;
