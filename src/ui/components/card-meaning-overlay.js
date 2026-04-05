export function buildMeaningOverlay(meaning) {
  return {
    title: `${meaning.cardName} (${meaning.orientation})`,
    keywords: meaning.keywords,
    text: meaning.text
  };
}
