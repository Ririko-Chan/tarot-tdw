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

  const reading = createReading({
    cards: deck.cards,
    question,
    context,
    cardCount: ensureCardCount(spread, cardCount),
    reversedChance: settings.reversedChance,
    hintChance: settings.hintChance,
    hints,
    spread
  });

  return {
    ...reading,
    deck: {
      id: deck.id,
      name: deck.name,
      backImage: deck.backImage,
      cardImages: deck.cards.map((card) => card.image).filter(Boolean)
    },
    settingsSnapshot: {
      deckId: settings.deckId,
      reversedChance: settings.reversedChance,
      hintChance: settings.hintChance
    }
  };
}
