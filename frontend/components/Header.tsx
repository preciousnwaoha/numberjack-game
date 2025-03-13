"use client"

import type React from "react"
import styles from "./Header.module.css"
import { useGame } from "@/context/GameContext"

const Header: React.FC = () => {
  const { roomData } = useGame()

  if (!roomData) return null

  const gameRound = roomData.roundCurrentValue

  const handleReload = () => {
    if (confirm("Sure you want to reload NUMBERJACK !!")) {
      window.location.reload()
    }
  }

  // const handleReload = () => {
  //   if (confirm("Are you sure you want to reload NUMBERJACK?")) {
  //     startGame(0, 0, 0) // Reset the game
  //   }
  // }

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={handleReload}>
        number<span>jack</span>
      </div>
      {gameRound > 0 && <div className={styles.gameRound}>Round {gameRound}</div>}
    </header>
  )
}

export default Header

