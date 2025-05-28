"use client"

import { useDrop } from "react-dnd"
import Card from "./card"

export default function CardPile({ cards, pileType, onClick, onDropCard, onDragCard, onCardClick }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "card",
    drop: (item) => {
      if (onDropCard && item.card && item.source) {
        // Log the drop event
        console.log("Card dropped:", {
          card: item.card,
          source: item.source,
          destination: pileType,
          cards: item.cards || [item.card],
        })

        // Always pass the current pile type as the destination
        onDropCard(
          item.card,
          item.source,
          item.sourceIndex,
          item.cards || [item.card],
          pileType, // Pass the destination pile type
        )
      }
      return { pileType }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  // Different rendering for different pile types
  if (pileType === "stock") {
    return (
      <div
        ref={drop}
        className={`h-32 w-24 rounded-lg border-2 ${
          cards.length > 0 ? "bg-blue-900 cursor-pointer" : "border-dashed border-white/50 bg-emerald-900/30"
        } ${isOver && canDrop ? "border-yellow-400" : "border-white/20"}`}
        onClick={onClick}
      >
        {cards.length > 0 && (
          <div className="flex justify-center items-center h-full">
            <span className="text-white font-bold">{cards.length}</span>
          </div>
        )}
      </div>
    )
  }

  if (pileType === "waste") {
    return (
      <div
        ref={drop}
        className={`h-32 w-24 rounded-lg border-2 ${
          cards.length === 0 ? "border-dashed border-white/50 bg-emerald-900/30" : "bg-emerald-900/50"
        } ${isOver && canDrop ? "border-yellow-400" : "border-white/20"}`}
      >
        {cards.length > 0 && (
          <Card
            card={cards[cards.length - 1]}
            index={cards.length - 1}
            source={pileType}
            onDrag={
              onDragCard
                ? () => {
                    // Just return card info, don't trigger a move yet
                    if (onDragCard) {
                      return onDragCard(cards[cards.length - 1])
                    }
                    return {
                      card: cards[cards.length - 1],
                      source: pileType,
                      sourceIndex: cards.length - 1,
                    }
                  }
                : undefined
            }
          />
        )}
      </div>
    )
  }

  if (pileType.startsWith("foundation")) {
    return (
      <div
        ref={drop}
        className={`h-32 w-24 rounded-lg border-2 ${
          cards.length === 0 ? "border-dashed border-white/50 bg-emerald-900/30" : "bg-emerald-900/50"
        } ${isOver && canDrop ? "border-yellow-400" : "border-white/20"}`}
      >
        {cards.length > 0 && (
          <Card
            card={cards[cards.length - 1]}
            index={cards.length - 1}
            source={pileType}
            onDrag={onDragCard ? () => onDragCard(cards[cards.length - 1]) : undefined}
          />
        )}
      </div>
    )
  }

  // Tableau piles - cards are stacked with overlap
  return (
    <div
      ref={drop}
      className={`min-h-32 w-24 rounded-lg border-2 ${
        cards.length === 0 ? "border-dashed border-white/50 bg-emerald-900/30 h-32" : "bg-transparent pb-24"
      } ${isOver && canDrop ? "border-yellow-400" : "border-white/20"}`}
    >
      {cards.map((card, index) => (
        <div
          key={`${card.suit}-${card.value}-${index}`}
          className="relative"
          style={{ marginTop: index > 0 ? "-80%" : "0" }}
          onClick={() => onCardClick && onCardClick(index)}
        >
          <Card
            card={card}
            index={index}
            source={pileType}
            onDrag={card.faceUp && onDragCard ? () => onDragCard(card, index) : undefined}
          />
        </div>
      ))}
    </div>
  )
}
