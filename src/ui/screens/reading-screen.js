function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderReadingScreen(root, reading) {
  if (!root) return;
  const items = (reading?.cards || []).map((entry) => {
    const reversedClass = entry.orientation === "reversed" ? "card-image--reversed" : "";
    return `
      <li class="reading-card-item">
        <img class="card-image ${reversedClass}" src="${escapeHtml(entry.card.image)}" alt="${escapeHtml(entry.card.name)}" loading="lazy" />
        <div>
          <strong>${escapeHtml(entry.card.name)}</strong> (${escapeHtml(entry.orientation)})
          <p>${escapeHtml(entry.meaning.text)}</p>
        </div>
      </li>
    `;
  }).join("");

  root.innerHTML = `
    <section>
      <h2>Расклад</h2>
      <p><strong>Вопрос:</strong> ${escapeHtml(reading?.question || "—")}</p>
      <ul class="reading-list">${items}</ul>
    </section>
  `;
}
