export function renderReadingScreen(root, reading) {
  if (!root) return;
  const items = (reading?.cards || []).map((entry) => `
    <li>
      <strong>${entry.card.name}</strong> (${entry.orientation}) — ${entry.meaning.text}
    </li>
  `).join("");

  root.innerHTML = `
    <section>
      <h2>Расклад</h2>
      <ul>${items}</ul>
    </section>
  `;
}
