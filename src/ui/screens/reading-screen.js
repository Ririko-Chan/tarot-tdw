import { buildMeaningOverlay } from "../components/card-meaning-overlay.js";
import { renderTarotCard } from "../components/tarot-card.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderOverlayModal() {
  return `
    <dialog id="meaning-overlay" class="meaning-overlay">
      <article class="meaning-overlay__content">
        <h3>Карта</h3>
        <p>Нажмите на карту, чтобы посмотреть трактовку.</p>
        <button type="button" id="close-overlay-btn">Закрыть</button>
      </article>
    </dialog>
  `;
}

function buildCopyText(reading) {
  return (reading?.cards || []).map((entry, index) => {
    const reversed = entry.orientation === "reversed" ? " (перевернута)" : "";
    return `${index + 1}. ${entry.card.name}${reversed}`;
  }).join("\n");
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = text;
  document.body.appendChild(fallback);
  fallback.select();
  document.execCommand("copy");
  document.body.removeChild(fallback);
}

export function renderReadingScreen(root, reading, { onBack, onSave } = {}) {
  if (!root) return;

  const items = (reading?.cards || []).map((entry, index) => {
    const viewModel = renderTarotCard({ card: entry.card, orientation: entry.orientation });
    const reversedClass = viewModel.orientation === "reversed" ? "card-image--reversed" : "";

    return `
      <li class="reading-card-item" data-card-index="${index}">
        <button type="button" class="meaning-open-btn" data-card-index="${index}" aria-label="Открыть трактовку карты ${escapeHtml(viewModel.title)}">
          <img class="card-image ${reversedClass}" src="${escapeHtml(viewModel.image)}" alt="${escapeHtml(viewModel.title)}" loading="lazy" />
        </button>
      </li>
    `;
  }).join("");

  const spreadTitle = reading?.spread?.name ? `<p><strong>Расклад:</strong> ${escapeHtml(reading.spread.name)}</p>` : "";
  const hint = reading?.hint ? `<p><strong>Подсказка колоды:</strong> ${escapeHtml(reading.hint)}</p>` : "";

  root.innerHTML = `
    <section>
      <div class="screen-header">
        <button id="reading-back-btn" type="button" class="secondary-btn">← Назад</button>
        <h2>Расклад</h2>
      </div>
      <p><strong>Вопрос:</strong> ${escapeHtml(reading?.question || "—")}</p>
      ${spreadTitle}
      ${hint}
      <div class="reading-actions">
        <button id="save-reading-btn" type="button">Сохранить</button>
        <button id="copy-reading-btn" type="button" class="secondary-btn">Копировать</button>
      </div>
      <p class="reading-help">Нажмите на карту, чтобы открыть её трактовку.</p>
      <ul class="reading-list reading-list--cards">${items}</ul>
      ${renderOverlayModal()}
      <div id="bottom-toast" class="bottom-toast" aria-live="polite"></div>
    </section>
  `;

  const overlayDialog = root.querySelector("#meaning-overlay");
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

  root.querySelector("#reading-back-btn")?.addEventListener("click", () => {
    onBack?.();
  });

  root.querySelector("#save-reading-btn")?.addEventListener("click", () => {
    onSave?.(reading);
    showToast("Расклад сохранён");
  });

  root.querySelector("#copy-reading-btn")?.addEventListener("click", async () => {
    const text = buildCopyText(reading);
    try {
      await copyToClipboard(text);
      showToast("Скопировано в буфер обмена");
    } catch {
      showToast("Не удалось скопировать");
    }
  });

  root.querySelectorAll(".meaning-open-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-card-index"));
      const entry = reading?.cards?.[index];
      if (!entry || !overlayDialog) return;

      const overlay = buildMeaningOverlay(entry.meaning);
      const positionLine = entry.position ? `<p><strong>Позиция:</strong> ${escapeHtml(entry.position)}</p>` : "";

      overlayDialog.innerHTML = `
        <article class="meaning-overlay__content">
          <h3>${escapeHtml(overlay.title)}</h3>
          ${positionLine}
          <p><strong>Ключевые слова:</strong> ${escapeHtml((overlay.keywords || []).join(", ") || "—")}</p>
          <p>${escapeHtml(overlay.text || "—")}</p>
          <button type="button" id="close-overlay-btn">Закрыть</button>
        </article>
      `;

      overlayDialog.querySelector("#close-overlay-btn")?.addEventListener("click", () => {
        overlayDialog.close("close");
      });

      if (typeof overlayDialog.showModal === "function") {
        overlayDialog.showModal();
      }
    });
  });
}
