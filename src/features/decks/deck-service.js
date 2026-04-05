import cards from "../../data/decks/rider-waite/cards.json" with { type: "json" };
import meta from "../../data/decks/rider-waite/meta.json" with { type: "json" };
import { assertCard } from "../../core/validators.js";

const DEFAULT_DECK_ID = "rider-waite";

export function getDeck(deckId = DEFAULT_DECK_ID) {
  if (deckId !== DEFAULT_DECK_ID) {
    return getDeck(DEFAULT_DECK_ID);
  }

  const validatedCards = cards.map(assertCard);
  return {
    ...meta,
    cards: validatedCards
  };
}
