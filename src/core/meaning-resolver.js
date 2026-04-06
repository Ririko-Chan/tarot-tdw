const CONTEXT_ALIAS = {
  love: "relationships",
  relation: "relationships",
  relationships: "relationships",
  career: "career",
  general: "general",
  advice: "advice"
};

export function normalizeContext(context = "general") {
  const normalizedInput = String(context || "").trim().toLowerCase();
  return CONTEXT_ALIAS[normalizedInput] || "general";
}

export function resolveMeaning(card, orientation, context = "general") {
  const safeOrientation = orientation === "reversed" ? "reversed" : "upright";
  const normalizedContext = normalizeContext(context);
  const meaning = card?.meanings?.[safeOrientation] || {};

  return {
    cardId: card?.id,
    cardName: card?.name,
    orientation: safeOrientation,
    keywords: meaning.keywords || [],
    text: meaning[normalizedContext] || meaning.general || ""
  };
}
