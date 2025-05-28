"use client"

import { useDrag } from "react-dnd"
import { Heart, Club, Diamond, Spade } from "lucide-react"

export default function Card({ card, index, source, onDrag }) {
  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: () => {
      if (onDrag) {
        const dragInfo = onDrag(card, index)
        // If dragInfo is null, don't allow dragging
        if (!dragInfo) return null

        // Return the drag info
        return {
          card,
          source: source,
          sourceIndex: index,
          cards: dragInfo?.cards || [card],
        }
      }
      return { card, source, sourceIndex: index }
    },
    canDrag: !!onDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  if (!card.faceUp) {
    return (
      <div
        ref={drag}
        className={`h-32 w-24 rounded-lg bg-blue-900 border-2 border-white/20 shadow-md ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="flex justify-center items-center h-full">
          <div className="w-12 h-16 rounded-md bg-blue-800"></div>
        </div>
      </div>
    )
  }

  const getSuitIcon = (suit) => {
    switch (suit) {
      case "hearts":
        return <Heart className="h-4 w-4 fill-current text-red-600" />
      case "diamonds":
        return <Diamond className="h-4 w-4 fill-current text-red-600" />
      case "clubs":
        return <Club className="h-4 w-4 fill-current text-black" />
      case "spades":
        return <Spade className="h-4 w-4 fill-current text-black" />
      default:
        return null
    }
  }

  const getCardValue = (value) => {
    switch (value) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return value.toString()
    }
  }

  const textColor = card.suit === "hearts" || card.suit === "diamonds" ? "text-red-600" : "text-black"

  return (
    <div
      ref={drag}
      className={`h-32 w-24 rounded-lg bg-white border-2 border-gray-300 shadow-md flex flex-col justify-between p-2 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className={`flex items-center ${textColor}`}>
        <span className="font-bold mr-1">{getCardValue(card.value)}</span>
        {getSuitIcon(card.suit)}
      </div>

      <div className="flex justify-center items-center">
        <div className={`${textColor} text-3xl`}>{getSuitIcon(card.suit)}</div>
      </div>

      <div className={`flex items-center justify-end ${textColor}`}>
        <span className="font-bold mr-1">{getCardValue(card.value)}</span>
        {getSuitIcon(card.suit)}
      </div>
    </div>
  )
}
