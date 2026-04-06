function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function renderSettingsScreen(root, settings, { onBack, onSave } = {}) {
  if (!root) return;

  const safeSettings = {
    deckId: settings?.deckId || "rider-waite",
    reversedChance: toNumber(settings?.reversedChance, 20),
    hintChance: toNumber(settings?.hintChance, 15)
  };

  root.innerHTML = `
    <section>
      <div class="screen-header">
        <button id="settings-back-btn" type="button" class="secondary-btn">← Назад</button>
        <h2>Настройки</h2>
      </div>

      <form id="settings-form" class="settings-form">
        <label for="deck-select">Колода</label>
        <select id="deck-select" name="deckId">
          <option value="rider-waite" ${safeSettings.deckId === "rider-waite" ? "selected" : ""}>Rider-Waite</option>
        </select>

        <label for="reversed-chance">Перевёрнутые карты: <strong id="reversed-value">${safeSettings.reversedChance}%</strong></label>
        <input id="reversed-chance" name="reversedChance" type="range" min="0" max="100" step="1" value="${safeSettings.reversedChance}" />

        <label for="hint-chance">Подсказка колоды: <strong id="hint-value">${safeSettings.hintChance}%</strong></label>
        <input id="hint-chance" name="hintChance" type="range" min="0" max="100" step="1" value="${safeSettings.hintChance}" />

        <div class="settings-actions">
          <button type="submit">Сохранить настройки</button>
        </div>
      </form>

      <div id="bottom-toast" class="bottom-toast" aria-live="polite"></div>
    </section>
  `;

  const form = root.querySelector("#settings-form");
  const reversedInput = root.querySelector("#reversed-chance");
  const hintInput = root.querySelector("#hint-chance");
  const reversedValue = root.querySelector("#reversed-value");
  const hintValue = root.querySelector("#hint-value");
  const toastEl = root.querySelector("#bottom-toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 1800);
  };

  reversedInput?.addEventListener("input", () => {
    if (reversedValue) reversedValue.textContent = `${reversedInput.value}%`;
  });

  hintInput?.addEventListener("input", () => {
    if (hintValue) hintValue.textContent = `${hintInput.value}%`;
  });

  root.querySelector("#settings-back-btn")?.addEventListener("click", () => {
    onBack?.();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const deckSelect = form.querySelector("#deck-select");
    const next = {
      deckId: deckSelect?.value || "rider-waite",
      reversedChance: toNumber(reversedInput?.value, safeSettings.reversedChance),
      hintChance: toNumber(hintInput?.value, safeSettings.hintChance)
    };

    onSave?.(next);
    showToast("Настройки сохранены");
  });
}
