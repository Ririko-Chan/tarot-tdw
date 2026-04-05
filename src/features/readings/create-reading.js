import hints from "../../data/hints.json" with { type: "json" };
import { createReading } from "../../core/reading-engine.js";
import { getDeck } from "../decks/deck-service.js";
import { getSettings } from "../settings/settings-repo.js";

export function createReadingUseCase({ question, context, cardCount, settingsOverride } = {}) {
  const settings = { ...getSettings(), ...(settingsOverride || {}) };
  const deck = getDeck(settings.deckId);

  return createReading({
    cards: deck.cards,
    question,
    context,
    cardCount,
    reversedChance: settings.reversedChance,
    hintChance: settings.hintChance,
    hints
  });
}
