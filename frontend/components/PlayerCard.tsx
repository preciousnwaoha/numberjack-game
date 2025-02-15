"use client"

import type React from "react"
import styles from "./PlayerCard.module.css"
import { useGame } from "@/context/GameContext"

interface PlayerCardProps {
  playerNumber: number
  isCurrentPlayer: boolean
  color: string
  isComputer: boolean
}

const PlayerCard: React.FC<PlayerCardProps> = ({ playerNumber, isCurrentPlayer, color, isComputer }) => {
  const { drawCard, skipTurn, players } = useGame()

  const player = players[playerNumber - 1]

  return (

    <>
      <div className={`${styles.playerCard} ${isCurrentPlayer ? "border-2 border-secondary" : ""}`}>
      <div className={styles.playerAndScore}>
        <span className="font-bold">Player {player.id + 1}</span>
        <span>{player.isComputer ? "Computer" : "Human"}</span>
      </div>
      <div className={`text-2xl font-bold mb-2 ${styles.sumEl}`}>Total: {player.total}</div>
      <div className={`text-sm ${styles.playerDrawsNoEl}`}>Cards: {player.cards.join(", ")}</div>
      {!player.isActive && <div className={`text-red-500 mt-2 ${styles.pCover}`}>Out of the game</div>}
    </div>

    <div
      className={`${styles.playerCard} ${isCurrentPlayer ? styles.active : ""}`}
      style={{ "--player-color": color } as React.CSSProperties}
    >
      <div className={styles.playerIcon}>
        {isComputer ? (
          <svg className={styles.computerIcon} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path d="m88.033 661.66c-7.0653 0-12.752 5.6886-12.752 12.754v207.45c0 7.0653 5.6867 12.752 12.752 12.752h122.43v39.17h-13.889c-2.5684 0-4.6367 2.0684-4.6367 4.6367 0 2.5684 2.0684 4.6367 4.6367 4.6367h106.85c2.5684 0 4.6367-2.0684 4.6367-4.6367 0-2.5684-2.0684-4.6367-4.6367-4.6367h-13.889v-39.17h122.43c7.0653-1e-5 12.752-5.6867 12.752-12.752v-207.45c0-7.0653-5.6866-12.754-12.752-12.754zm3.4863 15.789h316.96v200.05h-316.96z" />
          </svg>
        ) : (
          <svg className={styles.personIcon} viewBox="0 0 767.77302 800.00001" xmlns="http://www.w3.org/2000/svg">
            <path d="m399.99 234.11c-51.824 2.4e-4 -93.835 42.012-93.835 93.835-6.5e-4 51.824 42.011 93.837 93.835 93.837 51.824-2.3e-4 93.836-42.013 93.835-93.837-2.4e-4 -51.824-42.012-93.835-93.835-93.835zm84.258 185.78c-22.985 21.114-53.047 32.853-84.258 32.901-31.166-0.0566-61.183-11.769-84.151-32.835-46.6 30.851-74.96 85.053-75.04 143.42 0.0313 0.83786 0.0686 1.6754 0.11151 2.5127h318.18c0.0436-0.83725 0.0813-1.6748 0.11311-2.5127-0.0349-58.365-28.354-112.59-74.931-143.48z" />
          </svg>
        )}
      </div>
      <div className={styles.playerNumber}>Player {playerNumber}</div>
      {isCurrentPlayer && (
        <div className={styles.playerControls}>
          <button className={styles.drawCard} onClick={drawCard}>
            Draw Card
          </button>
          <button className={styles.skipTurn} onClick={skipTurn}>
            Skip Turn
          </button>
        </div>
      )}
    </div>
    </>
    
  )
}

export default PlayerCard

