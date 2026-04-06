export function renderSettingsScreen(root, settings, { onBack } = {}) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <div class="screen-header">
        <button id="settings-back-btn" type="button" class="secondary-btn">← Назад</button>
        <h2>Настройки</h2>
      </div>
      <p>Колода: ${settings.deckId}</p>
      <p>Перевёрнутые: ${settings.reversedChance}%</p>
      <p>Подсказка: ${settings.hintChance}%</p>
    </section>
  `;

  root.querySelector("#settings-back-btn")?.addEventListener("click", () => {
    onBack?.();
  });
}
