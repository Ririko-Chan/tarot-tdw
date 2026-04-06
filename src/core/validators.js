export function assertCard(card) {
  if (!card || typeof card !== "object") throw new Error("Card must be an object");
  if (typeof card.id !== "number") throw new Error("Card.id must be number");
  if (!card.name) throw new Error("Card.name is required");
  if (!card.meanings?.upright || !card.meanings?.reversed) {
    throw new Error("Card meanings.upright/reversed are required");
  }
  return card;
}

export function assertSpread(spread) {
  if (!spread?.id) throw new Error("Spread.id is required");
  if (!spread?.name) throw new Error("Spread.name is required");
  if (typeof spread.cardCount !== "number" && typeof spread.cardCount !== "object") {
    throw new Error("Spread.cardCount must be number or range object");
  }

  if (typeof spread.cardCount === "number") {
    if (!Number.isInteger(spread.cardCount) || spread.cardCount < 1) {
      throw new Error("Spread.cardCount must be integer >= 1");
    }
  }

  if (typeof spread.cardCount === "object") {
    const min = Number(spread.cardCount?.min);
    const max = Number(spread.cardCount?.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < min) {
      throw new Error("Spread.cardCount range is invalid");
    }
  }

  if (spread.positions && !Array.isArray(spread.positions)) {
    throw new Error("Spread.positions must be an array");
  }

  if (Array.isArray(spread.positions) && typeof spread.cardCount === "number" && spread.positions.length > 0) {
    if (spread.positions.length !== spread.cardCount) {
      throw new Error("Spread.positions length must match spread.cardCount");
    }
  }
  return spread;
}
