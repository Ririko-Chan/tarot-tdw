import { createId, rollChance, shuffle } from "./random.js";
import { resolveMeaning } from "./meaning-resolver.js";

export function createReading({
  cards,
  question,
  context = "general",
  cardCount = 1,
  reversedChance = 0,
  hintChance = 0,
  hints = [],
  rng = Math.random
}) {
  const limitedCount = Math.max(1, Math.min(Number(cardCount) || 1, cards.length));
  const selected = shuffle(cards, rng).slice(0, limitedCount).map((card) => {
    const orientation = rollChance(reversedChance, rng) ? "reversed" : "upright";
    return {
      card,
      orientation,
      meaning: resolveMeaning(card, orientation, context)
    };
  });

  const hint = rollChance(hintChance, rng) && hints.length > 0
    ? hints[Math.floor(rng() * hints.length)]
    : null;

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    question,
    context,
    cardCount: limitedCount,
    cards: selected,
    hint
  };
}
