"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ScorePanel({ score, time, onNewGame, onUndo, canUndo, isGameWon }) {
  return (
    <div className="bg-white/10 rounded-lg p-4 flex flex-wrap justify-between items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="hidden sm:block bg-white/90 p-2 rounded-lg shadow w-12 h-12">
          <Image
            src="/images/fox-poker-logo.png"
            alt="FoxPocker Logo"
            width={48}
            height={48}
            className="w-full h-auto"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-white">Score: {score}</h2>
          <p className="text-white/80">Time: {time}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onUndo}
          disabled={!canUndo}
          className="bg-white/10 text-white border-white/30 hover:bg-white/20"
        >
          Undo
        </Button>
        <Button onClick={onNewGame} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          New Game
        </Button>
      </div>

      {isGameWon && (
        <div className="w-full mt-2 bg-emerald-600/80 p-2 rounded text-center text-white font-bold">
          Congratulations! You won the game!
        </div>
      )}
    </div>
  )
}
