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
  return spread;
}
