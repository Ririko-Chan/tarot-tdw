import { createId, rollChance, shuffle } from "./random.js";
import { normalizeContext, resolveMeaning } from "./meaning-resolver.js";

export function createReading({
  cards,
  question,
  context = "general",
  cardCount = 1,
  reversedChance = 0,
  hintChance = 0,
  hints = [],
  spread = null,
  rng = Math.random
}) {
  const normalizedContext = normalizeContext(context);
  const limitedCount = Math.max(1, Math.min(Number(cardCount) || 1, cards.length));
  const selected = shuffle(cards, rng).slice(0, limitedCount).map((card, index) => {
    const orientation = rollChance(reversedChance, rng) ? "reversed" : "upright";
    return {
      card,
      orientation,
      meaning: resolveMeaning(card, orientation, normalizedContext),
      position: spread?.positions?.[index] || null
    };
  });

  const hint = rollChance(hintChance, rng) && hints.length > 0
    ? hints[Math.floor(rng() * hints.length)]
    : null;

  return {
    id: createId("reading", rng),
    createdAt: new Date().toISOString(),
    question,
    context: normalizedContext,
    requestedContext: context,
    spread: spread ? { id: spread.id, name: spread.name } : null,
    cardCount: limitedCount,
    cards: selected,
    hint
  };
}
