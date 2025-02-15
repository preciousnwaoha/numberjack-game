"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface Player {
  id: number
  isComputer: boolean
  cards: number[]
  total: number
  isActive: boolean
  color: string
}

interface GameContextType {
  players: Player[]
  maxNumber: number
  currentPlayer: number
  gameRound: number
  scores: number[]
  startGame: (humanPlayers: number, computers: number, maxNumber: number) => void
  drawCard: () => void
  skipTurn: () => void
  isGameOver: boolean
  winner: number | null
  error: string | null
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([])
  const [maxNumber, setMaxNumber] = useState(0)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [gameRound, setGameRound] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [isGameOver, setIsGameOver] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback((humanPlayers: number, computers: number, maxNumber: number) => {
    const totalPlayers = humanPlayers + computers
    if (totalPlayers < 2 || totalPlayers > 12) {
      setError("Number of players must be between 2 and 12")
      return
    }
    if (maxNumber < 21 || maxNumber > 100) {
      setError("Max number must be between 21 and 100")
      return
    }

    const newPlayers: Player[] = Array.from({ length: totalPlayers }, (_, i) => ({
      id: i,
      isComputer: i >= humanPlayers,
      cards: [],
      total: 0,
      isActive: true,
      color: "black"
    }))

    setPlayers(newPlayers)
    setMaxNumber(maxNumber)
    setCurrentPlayer(0)
    setGameRound(1)
    setScores(new Array(totalPlayers).fill(0))
    setIsGameOver(false)
    setWinner(null)
    setError(null)
  }, [])

  const drawCard = useCallback(() => {
    if (isGameOver) return

    const newCard = Math.floor(Math.random() * 7) + 3 // Random number between 3 and 9
    const updatedPlayers = [...players]
    const player = updatedPlayers[currentPlayer]

    player.cards.push(newCard)
    player.total += newCard

    if (player.total > maxNumber) {
      player.isActive = false
    } else if (player.total === maxNumber) {
      setWinner(currentPlayer)
      setIsGameOver(true)
    }

    setPlayers(updatedPlayers)
    nextTurn()
  }, [currentPlayer, isGameOver, maxNumber, players])

  const skipTurn = useCallback(() => {
    if (isGameOver) return
    nextTurn()
  }, [isGameOver])

  const nextTurn = useCallback(() => {
    let nextPlayer = (currentPlayer + 1) % players.length
    while (!players[nextPlayer].isActive) {
      nextPlayer = (nextPlayer + 1) % players.length
      if (nextPlayer === currentPlayer) {
        // If we've looped back to the current player, all other players are inactive
        setWinner(currentPlayer)
        setIsGameOver(true)
        return
      }
    }
    setCurrentPlayer(nextPlayer)
  }, [currentPlayer, players])

  const value = {
    players,
    maxNumber,
    currentPlayer,
    gameRound,
    scores,
    startGame,
    drawCard,
    skipTurn,
    isGameOver,
    winner,
    error,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

