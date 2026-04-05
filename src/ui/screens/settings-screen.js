export function renderSettingsScreen(root, settings) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <h2>Настройки</h2>
      <p>Колода: ${settings.deckId}</p>
      <p>Перевёрнутые: ${settings.reversedChance}%</p>
      <p>Подсказка: ${settings.hintChance}%</p>
    </section>
  `;
}
