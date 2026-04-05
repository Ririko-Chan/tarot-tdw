import hints from "../../data/hints.json" with { type: "json" };
import { createReading } from "../../core/reading-engine.js";
import { getDeck } from "../decks/deck-service.js";
import { getSettings } from "../settings/settings-repo.js";
import { ensureCardCount, getSpreads } from "../spreads/spread-service.js";

function getSpreadById(spreadId) {
  const spreads = getSpreads();
  return spreads.find((spread) => spread.id === spreadId) || spreads[0];
}

export function createReadingUseCase({ question, context, cardCount, spreadId = "free-1-24", settingsOverride } = {}) {
  const settings = { ...getSettings(), ...(settingsOverride || {}) };
  const deck = getDeck(settings.deckId);
  const spread = getSpreadById(spreadId);

  return createReading({
    cards: deck.cards,
    question,
    context,
    cardCount: ensureCardCount(spread, cardCount),
    reversedChance: settings.reversedChance,
    hintChance: settings.hintChance,
    hints,
    spread
  });
}
