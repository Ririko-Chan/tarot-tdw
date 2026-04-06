function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderHistoryScreen(root, history = [], { onBack, onDelete, onRename } = {}) {
  if (!root) return;

  const historyItems = history.length > 0
    ? history.map((item) => `
      <li class="history-item" data-history-id="${escapeHtml(item.id)}">
        <div class="history-item__top">
          <strong>${escapeHtml(item.name || item.question || item.id)}</strong>
          <small>${escapeHtml(item.createdAt || "—")}</small>
        </div>
        <p><strong>Вопрос:</strong> ${escapeHtml(item.question || "—")}</p>
        <p><strong>Контекст:</strong> ${escapeHtml(item.context || "general")}</p>
        <div class="history-item__actions">
          <button type="button" class="history-rename-btn secondary-btn" data-history-id="${escapeHtml(item.id)}">Переименовать</button>
          <button type="button" class="history-delete-btn secondary-btn" data-history-id="${escapeHtml(item.id)}">Удалить</button>
        </div>
      </li>
    `).join("")
    : "<li>История пока пуста.</li>";

  root.innerHTML = `
    <section>
      <div class="screen-header">
        <button id="history-back-btn" type="button" class="secondary-btn">← Назад</button>
        <h2>История</h2>
      </div>
      <ol class="history-list">
        ${historyItems}
      </ol>
    </section>
  `;

  root.querySelector("#history-back-btn")?.addEventListener("click", () => {
    onBack?.();
  });

  root.querySelectorAll(".history-delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-history-id");
      if (id) onDelete?.(id);
    });
  });

  root.querySelectorAll(".history-rename-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-history-id");
      if (!id) return;
      const value = window.prompt("Новое название расклада", "");
      if (!value || !value.trim()) return;
      onRename?.(id, value.trim());
    });
  });
}
