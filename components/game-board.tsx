"use client"
import CardPile from "./card-pile"
import { isValidMove } from "@/lib/game-utils"

export default function GameBoard({ gameState, onMove, isGameWon }) {
  const { stock, waste, foundations, tableau } = gameState

  // Handle stock click
  const handleStockClick = () => {
    onMove({ type: "stock-to-waste" })
  }

  return (
    <div className="w-full bg-emerald-800 rounded-lg p-4 shadow-xl">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {/* Stock pile */}
        <div className="col-span-1">
          <CardPile cards={stock} pileType="stock" onClick={handleStockClick} />
        </div>

        {/* Waste pile */}
        <div className="col-span-1">
          <CardPile
            cards={waste}
            pileType="waste"
            onDragCard={(card) => {
              // Just return the card info, don't trigger a move yet
              return {
                card,
                source: "waste",
                sourceIndex: waste.length - 1,
                cards: [card],
              }
            }}
            onDropCard={(card, source, sourceIndex, cards, destination) => {
              if (source === "waste" && destination && destination.startsWith("tableau")) {
                const tableauIndex = Number.parseInt(destination.split("-")[1])
                onMove({
                  type: "waste-to-tableau",
                  source: "waste",
                  sourceIndex: waste.length - 1,
                  destination: destination,
                  destinationIndex: tableau[tableauIndex].length,
                  cards: [card],
                })
              } else if (source === "waste" && destination && destination.startsWith("foundation")) {
                const foundationIndex = Number.parseInt(destination.split("-")[1])
                onMove({
                  type: "waste-to-foundation",
                  source: "waste",
                  sourceIndex: waste.length - 1,
                  destination: destination,
                  destinationIndex: foundations[foundationIndex].length,
                  cards: [card],
                })
              }
            }}
          />
        </div>

        {/* Spacer */}
        <div className="col-span-1"></div>

        {/* Foundation piles */}
        {foundations.map((foundation, index) => (
          <div key={`foundation-${index}`} className="col-span-1">
            <CardPile
              cards={foundation}
              pileType={`foundation-${index}`}
              onDropCard={(card, source, sourceIndex, cards, destination) => {
                // Don't allow moving between foundation piles
                if (source && source.startsWith("foundation") && destination && destination.startsWith("foundation")) {
                  return
                }

                // Log the move attempt for debugging
                console.log("Attempting foundation move:", {
                  card,
                  source,
                  destination: `foundation-${index}`,
                  cards,
                  foundationLength: foundation.length,
                })

                // Make sure we have all required data
                if (!source || !cards || !cards.length) {
                  console.error("Invalid move data", { source, cards })
                  return
                }

                // For tableau-to-foundation moves, we need to ensure we're using the right move type
                let moveType = "waste-to-foundation"
                if (source.startsWith("tableau")) {
                  moveType = "tableau-to-foundation"
                }

                // Check if this is a valid move
                const isValid = isValidMove(gameState, {
                  source,
                  destination: `foundation-${index}`,
                  cards: [card], // Only move one card to foundation
                })

                console.log("Foundation move validation result:", isValid)

                if (isValid) {
                  onMove({
                    type: moveType,
                    source,
                    sourceIndex,
                    destination: `foundation-${index}`,
                    destinationIndex: foundation.length,
                    cards: [card], // Only move one card to foundation
                  })
                } else {
                  // Log why the move might be invalid
                  const movingCard = cards[0]
                  console.log("Foundation move validation details:", {
                    foundationIndex: index,
                    foundationLength: foundation.length,
                    movingCardValue: movingCard.value,
                    movingCardSuit: movingCard.suit,
                    isAce: movingCard.value === 1,
                    emptyFoundation: foundation.length === 0,
                  })
                }
              }}
              onDragCard={(card) => {
                // Just return the card info, don't trigger a move yet
                return {
                  card,
                  source: `foundation-${index}`,
                  sourceIndex: foundation.length - 1,
                  cards: [card],
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Tableau piles */}
      <div className="grid grid-cols-7 gap-2">
        {tableau.map((pile, index) => (
          <div key={`tableau-${index}`} className="col-span-1">
            <CardPile
              cards={pile}
              pileType={`tableau-${index}`}
              onDropCard={(card, source, sourceIndex, cards, destination) => {
                // Log the move attempt for debugging
                console.log("Attempting tableau move:", {
                  card,
                  source,
                  destination,
                  cards,
                  topCard: pile.length > 0 ? pile[pile.length - 1] : null,
                })

                // Make sure we have all required data
                if (!source || !cards || !cards.length) {
                  console.error("Invalid move data", { source, cards })
                  return
                }

                // Set destination explicitly if not provided
                if (!destination) {
                  destination = `tableau-${index}`
                }

                // For tableau-to-tableau moves, we need to ensure we're using the right move type
                let moveType = "waste-to-tableau"
                if (source.startsWith("tableau")) {
                  moveType = "tableau-to-tableau"
                } else if (source.startsWith("foundation")) {
                  moveType = "foundation-to-tableau"
                }

                // Check if this is a valid move
                const isValid = isValidMove(gameState, {
                  source,
                  destination,
                  cards,
                })

                console.log("Move validation result:", isValid)

                if (isValid) {
                  onMove({
                    type: moveType,
                    source,
                    sourceIndex,
                    destination,
                    destinationIndex: pile.length,
                    cards,
                  })
                } else {
                  // Log why the move might be invalid
                  if (pile.length > 0) {
                    const topCard = pile[pile.length - 1]
                    const movingCard = cards[0]
                    console.log("Move validation details:", {
                      topCardValue: topCard.value,
                      topCardColor: topCard.color,
                      topCardFaceUp: topCard.faceUp,
                      movingCardValue: movingCard.value,
                      movingCardColor: movingCard.color,
                      correctValueDiff: topCard.value === movingCard.value + 1,
                      oppositeColors: topCard.color !== movingCard.color,
                    })
                  }
                }
              }}
              onDragCard={(card, cardIndex) => {
                // Get all cards from this index to the end (for dragging stacks)
                const cardsToMove = pile.slice(cardIndex)

                // Make sure the card is face up
                if (!card.faceUp) return null

                return {
                  card,
                  source: `tableau-${index}`,
                  sourceIndex: cardIndex,
                  cards: cardsToMove,
                }
              }}
              onCardClick={(cardIndex) => {
                // If the card is the last one and face down, flip it
                if (cardIndex === pile.length - 1 && !pile[cardIndex].faceUp) {
                  onMove({
                    type: "reveal-card",
                    tableauIndex: index,
                    cardIndex,
                  })
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
