import cards from "../../data/decks/rider-waite/cards.json" with { type: "json" };
import meta from "../../data/decks/rider-waite/meta.json" with { type: "json" };
import { assertCard } from "../../core/validators.js";

const DEFAULT_DECK_ID = "rider-waite";
const DECK_REGISTRY = {
  "rider-waite": {
    meta,
    cards
  }
};

export function getAvailableDecks() {
  return Object.values(DECK_REGISTRY).map(({ meta: deckMeta }) => ({
    id: deckMeta.id,
    name: deckMeta.name
  }));
}

export function getDeck(deckId = DEFAULT_DECK_ID) {
  const normalizedDeckId = DECK_REGISTRY[deckId] ? deckId : DEFAULT_DECK_ID;
  const selectedDeck = DECK_REGISTRY[normalizedDeckId];

  const validatedCards = selectedDeck.cards.map(assertCard);
  return {
    ...selectedDeck.meta,
    cards: validatedCards
  };
}
