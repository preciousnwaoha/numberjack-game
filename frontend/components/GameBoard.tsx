"use client"

import type React from "react"
import Header from "./Header"
import ThemeToggle from "./ThemeToggle"
import AboutModal from "./AboutModal"
import Scoreboard from "./Scoreboard"
import PlayerCard from "./PlayerCard"
import GameControls from "./GameControls"
import NotificationBar from "./NotificationBar"
import styles from "./GameBoard.module.css"
import { useGame } from "@/context/GameContext"

const GameBoard: React.FC = () => {
  const { players, currentPlayer, gameRound } = useGame()

  return (
    <div className={styles.gameBoard}>
      <Header />
      <ThemeToggle />
      <AboutModal />
      <Scoreboard />
      <NotificationBar message="Welcome to NUMBERJACK!" />

      {/* <div className={styles.wrapper}>
        {players.map((player, index) => (
          <PlayerCard key={player.id} player={player} isCurrentPlayer={index === currentPlayer} />
        ))}
      </div>
      <GameControls />
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl">Player {winner! + 1} wins!</p>
          </div>
        </div>
      )} */}

      {gameRound === 0 ? (
        <GameControls />
      ) : (
        <div className={styles.playerGrid}>
          {Array.from({ length: players.length }, (_, i) => (
            <PlayerCard
              key={i}
              playerNumber={i + 1}
              isCurrentPlayer={i === currentPlayer}
              color={players[i].color}
              isComputer={players[i].isComputer}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GameBoard
