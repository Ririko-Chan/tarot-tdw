import spreads from "../../data/spreads.json" with { type: "json" };
import { assertSpread } from "../../core/validators.js";

export function getSpreads() {
  return spreads.map(assertSpread);
}

export function ensureCardCount(spread, cardCount) {
  if (typeof spread.cardCount === "number") {
    return spread.cardCount;
  }

  const min = spread.cardCount?.min ?? 1;
  const max = spread.cardCount?.max ?? 24;
  const normalizedCardCount = Number(cardCount);
  const safeCardCount = Number.isFinite(normalizedCardCount)
    ? Math.trunc(normalizedCardCount)
    : min;
  return Math.max(min, Math.min(max, safeCardCount));
}
