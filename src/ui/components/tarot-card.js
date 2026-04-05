export function renderTarotCard({ card, orientation }) {
  return {
    image: card.image,
    title: card.name,
    orientation
  };
}
