// Card type definition
export type Card = {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  value: number // 1 (Ace) through 13 (King)
  color: "red" | "black"
  faceUp: boolean
}

// Game state type definition
export type GameState = {
  stock: Card[]
  waste: Card[]
  foundations: Card[][]
  tableau: Card[][]
}

// Create a standard deck of 52 cards
export function createDeck(): Card[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"]
  const deck: Card[] = []

  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        suit: suit as Card["suit"],
        value,
        color: suit === "hearts" || suit === "diamonds" ? "red" : "black",
        faceUp: false,
      })
    }
  }

  return deck
}

// Shuffle the deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards to create the initial game state
export function dealCards(deck: Card[]): GameState {
  const gameState: GameState = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
  }

  // Deal cards to tableau
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      const card = deck.pop()!
      // Only the top card of each tableau pile is face up initially
      if (i === j) {
        card.faceUp = true
      }
      gameState.tableau[j].push(card)
    }
  }

  // Remaining cards go to the stock pile
  gameState.stock = deck

  return gameState
}

// Check if a move is valid according to solitaire rules
export function isValidMove(gameState: GameState, move: any): boolean {
  const { source, destination, cards } = move

  // Check if required properties exist
  if (!source || !destination || !cards || !cards.length) {
    console.log("Missing required move properties", { source, destination, cards })
    return false
  }

  // Don't allow moving between foundation piles
  if (source.startsWith("foundation") && destination.startsWith("foundation")) {
    console.log("Cannot move between foundation piles")
    return false
  }

  // Moving to foundation
  if (destination.startsWith("foundation")) {
    const foundationIndex = Number.parseInt(destination.split("-")[1])
    const card = cards[0] // Only one card can be moved to foundation at a time

    // Check if foundation index is valid
    if (foundationIndex < 0 || foundationIndex >= gameState.foundations.length) {
      console.log("Invalid foundation index", foundationIndex)
      return false
    }

    // Make sure the card is face up
    if (!card.faceUp) {
      console.log("Cannot move face-down card to foundation")
      return false
    }

    const foundation = gameState.foundations[foundationIndex]

    // Foundation must be built up by suit from Ace to King
    if (foundation.length === 0) {
      // First card must be an Ace
      const isValid = card.value === 1
      console.log(`Foundation empty, card is Ace (${card.value}): ${isValid}`, card)
      return isValid
    } else {
      const topCard = foundation[foundation.length - 1]
      // Card must be same suit and one value higher
      const sameSuit = card.suit === topCard.suit
      const oneHigher = card.value === topCard.value + 1
      const isValid = sameSuit && oneHigher

      console.log("Foundation move validation:", {
        topCard: `${topCard.value} of ${topCard.suit}`,
        movingCard: `${card.value} of ${card.suit}`,
        sameSuit,
        oneHigher,
        isValid,
      })

      return isValid
    }
  }

  // Moving to tableau
  if (destination.startsWith("tableau")) {
    const tableauIndex = Number.parseInt(destination.split("-")[1])

    // Check if tableau index is valid
    if (tableauIndex < 0 || tableauIndex >= gameState.tableau.length) {
      console.log("Invalid tableau index", tableauIndex)
      return false
    }

    const tableau = gameState.tableau[tableauIndex]
    const card = cards[0] // First card in the sequence being moved

    // Make sure the card is face up
    if (!card.faceUp) {
      console.log("Cannot move face-down card")
      return false
    }

    // Tableau can be built down in alternating colors
    if (tableau.length === 0) {
      // Empty tableau can only accept a King
      const isValid = card.value === 13
      console.log(`Empty tableau, card is King (${card.value}): ${isValid}`)
      return isValid
    } else {
      const topCard = tableau[tableau.length - 1]

      // Make sure the top card is face up
      if (!topCard.faceUp) {
        console.log("Top card is not face up")
        return false
      }

      // Card must be opposite color and one value lower
      const correctColor = topCard.color !== card.color
      const correctValue = topCard.value === card.value + 1
      const isValid = correctColor && correctValue

      console.log("Tableau move validation:", {
        topCard: `${topCard.value} of ${topCard.suit} (${topCard.color})`,
        movingCard: `${card.value} of ${card.suit} (${card.color})`,
        correctColor,
        correctValue,
        isValid,
      })

      return isValid
    }
  }

  return false
}
