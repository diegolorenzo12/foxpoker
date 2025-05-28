"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import GameBoard from "./game-board"
import ScorePanel from "./score-panel"
import { createDeck, shuffleDeck, dealCards } from "@/lib/game-utils"
import { useToast } from "@/hooks/use-toast"
import useMobile from "@/hooks/use-mobile"

export default function SolitaireGame() {
  const [gameState, setGameState] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isGameWon, setIsGameWon] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [])

  // Timer effect
  useEffect(() => {
    let timer
    if (startTime && !isGameWon) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [startTime, isGameWon])

  // Check win condition
  useEffect(() => {
    if (gameState && isGameWon === false) {
      const allFoundationsFull = gameState.foundations.every((foundation) => foundation.length === 13)
      if (allFoundationsFull) {
        setIsGameWon(true)
        toast({
          title: "Congratulations!",
          description: `You won in ${formatTime(elapsedTime)} with a score of ${score}!`,
          variant: "success",
        })
      }
    }
  }, [gameState, isGameWon, score, elapsedTime, toast])

  const startNewGame = () => {
    const deck = shuffleDeck(createDeck())
    const initialState = dealCards(deck)
    setGameState(initialState)
    setMoveHistory([])
    setScore(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setIsGameWon(false)
  }

  const handleMove = (move) => {
    // Save current state for undo
    setMoveHistory((prev) => [...prev, gameState])

    // Update game state based on move
    setGameState((prevState) => {
      const newState = executeMove(prevState, move)

      // Update score
      if (move.type === "tableau-to-foundation" || move.type === "waste-to-foundation") {
        setScore((prev) => prev + 10)
      } else if (move.type === "foundation-to-tableau") {
        setScore((prev) => prev - 5)
      } else if (move.type === "reveal-card") {
        setScore((prev) => prev + 5)
      }

      return newState
    })
  }

  const executeMove = (state, move) => {
    // Deep clone the state to avoid mutations
    const newState = JSON.parse(JSON.stringify(state))

    // Handle different move types
    switch (move.type) {
      case "stock-to-waste":
        if (newState.stock.length > 0) {
          const card = newState.stock.pop()
          card.faceUp = true
          newState.waste.push(card)
        } else if (newState.waste.length > 0) {
          // Reset stock from waste
          newState.stock = newState.waste.reverse().map((card) => ({ ...card, faceUp: false }))
          newState.waste = []
        }
        break

      case "waste-to-tableau":
      case "waste-to-foundation":
      case "tableau-to-tableau":
      case "tableau-to-foundation":
      case "foundation-to-tableau":
        // These moves are handled by the source and destination logic
        const { source, sourceIndex, destination, destinationIndex, cards } = move

        // Make sure source and cards are defined before using them
        if (!source || !cards) {
          console.error("Invalid move: missing source or cards", move)
          return state // Return original state if move is invalid
        }

        // For all moves, destination is required
        if (!destination) {
          console.error("Invalid move: missing destination", move)
          return state // Return original state if move is invalid
        }

        // Don't allow moving between foundation piles
        if (source.startsWith("foundation") && destination.startsWith("foundation")) {
          console.error("Invalid move: cannot move between foundation piles", move)
          return state
        }

        console.log("Executing move:", move.type, { source, destination, cards: cards.length })

        // Remove cards from source
        if (source === "waste") {
          if (newState.waste.length > 0) {
            newState.waste.pop()
          }
        } else if (source.startsWith("tableau")) {
          const tableauIndex = Number.parseInt(source.split("-")[1])
          if (tableauIndex >= 0 && tableauIndex < newState.tableau.length) {
            if (sourceIndex >= 0 && sourceIndex < newState.tableau[tableauIndex].length) {
              newState.tableau[tableauIndex].splice(sourceIndex)

              // Reveal the new top card if it exists and is face down
              if (
                newState.tableau[tableauIndex].length > 0 &&
                !newState.tableau[tableauIndex][newState.tableau[tableauIndex].length - 1].faceUp
              ) {
                newState.tableau[tableauIndex][newState.tableau[tableauIndex].length - 1].faceUp = true
              }
            }
          }
        } else if (source.startsWith("foundation")) {
          const foundationIndex = Number.parseInt(source.split("-")[1])
          if (foundationIndex >= 0 && foundationIndex < newState.foundations.length) {
            if (newState.foundations[foundationIndex].length > 0) {
              newState.foundations[foundationIndex].pop()
            }
          }
        }

        // Add cards to destination
        if (destination.startsWith("tableau")) {
          const tableauIndex = Number.parseInt(destination.split("-")[1])
          if (tableauIndex >= 0 && tableauIndex < newState.tableau.length) {
            newState.tableau[tableauIndex].push(...cards)
          }
        } else if (destination.startsWith("foundation")) {
          const foundationIndex = Number.parseInt(destination.split("-")[1])
          if (foundationIndex >= 0 && foundationIndex < newState.foundations.length) {
            newState.foundations[foundationIndex].push(...cards)
          }
        }
        break

      case "reveal-card":
        const { tableauIndex, cardIndex } = move
        if (
          tableauIndex !== undefined &&
          cardIndex !== undefined &&
          newState.tableau[tableauIndex] &&
          newState.tableau[tableauIndex][cardIndex]
        ) {
          newState.tableau[tableauIndex][cardIndex].faceUp = true
        }
        break
    }

    return newState
  }

  const handleUndo = () => {
    if (moveHistory.length > 0) {
      const previousState = moveHistory[moveHistory.length - 1]
      setGameState(previousState)
      setMoveHistory((prev) => prev.slice(0, -1))
      // Penalize score for undo
      setScore((prev) => Math.max(0, prev - 2))
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" + secs : secs}`
  }

  if (!gameState) return <div className="text-white">Loading game...</div>

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="flex flex-col gap-4">
        <ScorePanel
          score={score}
          time={formatTime(elapsedTime)}
          onNewGame={startNewGame}
          onUndo={handleUndo}
          canUndo={moveHistory.length > 0}
          isGameWon={isGameWon}
        />
        <GameBoard gameState={gameState} onMove={handleMove} isGameWon={isGameWon} />
      </div>
    </DndProvider>
  )
}
