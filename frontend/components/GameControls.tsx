"use client"

import { useState } from "react"
import { useGame } from "@/context/GameContext"
import styles from "./GameControls.module.css"

export default function GameControls() {
  const { startGame, drawCard, skipTurn, currentPlayer, players, isGameOver } = useGame()
  const [humanPlayers, setHumanPlayers] = useState(2)
  const [computers, setComputers] = useState(0)
  const [maxNumber, setMaxNumber] = useState(21)

  const handleStartGame = () => {
    startGame(humanPlayers, computers, maxNumber)
  }

  const canSkip = players[currentPlayer]?.cards.length > 0

  if (isGameOver) {
    return (
      <button className={styles.newGameBtn} onClick={() => startGame(humanPlayers, computers, maxNumber)}>
        New Game
      </button>
    )
  }

  if (players.length === 0) {
    return (
      <div className="mt-8 space-y-4">
        <div>
          <label className="block mb-2">Human Players:</label>
          <input
            type="number"
            value={humanPlayers}
            onChange={(e) => setHumanPlayers(Number(e.target.value))}
            min={1}
            max={12}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Computers:</label>
          <input
            type="number"
            value={computers}
            onChange={(e) => setComputers(Number(e.target.value))}
            min={0}
            max={11}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Max Number:</label>
          <input
            type="number"
            value={maxNumber}
            onChange={(e) => setMaxNumber(Number(e.target.value))}
            min={21}
            max={100}
            className="w-full p-2 border rounded"
          />
        </div>
        <button className={styles.startBtn} onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 space-x-4">
      <button className={styles.drawCard} onClick={drawCard}>
        Draw Card
      </button>
      {canSkip && (
        <button className={styles.skipTurn} onClick={skipTurn}>
          Skip Turn
        </button>
      )}
    </div>
  )
}

