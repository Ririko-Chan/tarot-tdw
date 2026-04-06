import { buildMeaningOverlay } from "../components/card-meaning-overlay.js";
import { renderTarotCard } from "../components/tarot-card.js";

const CARD_BACK_IMAGE = "./assets/images/rider/back.webp";
const APPEAR_DELAY_MS = 180;
const FLIP_DELAY_MS = 180;
const FIRST_CARD_DELAY_MS = 120;

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

    return `
      <li class="reading-card-item reading-card-item--hidden" data-card-index="${index}">
        <button type="button" class="meaning-open-btn meaning-open-btn--disabled" data-card-index="${index}" aria-label="Открыть трактовку карты ${escapeHtml(viewModel.title)}" disabled>
          <img
            class="card-image card-image--is-back"
            src="${CARD_BACK_IMAGE}"
            alt="Рубашка карты"
            loading="lazy"
            data-front-image="${escapeHtml(viewModel.image)}"
            data-front-title="${escapeHtml(viewModel.title)}"
            data-orientation="${escapeHtml(viewModel.orientation)}"
          />
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
  const cardItems = Array.from(root.querySelectorAll(".reading-card-item"));
  const cardButtons = Array.from(root.querySelectorAll(".meaning-open-btn"));
  let toastTimer;
  let isAnimatingCards = cardItems.length > 0;

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
      if (isAnimatingCards) return;
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

  cardItems.forEach((item, index) => {
    window.setTimeout(() => {
      item.classList.remove("reading-card-item--hidden");
      item.classList.add("reading-card-item--visible");
    }, FIRST_CARD_DELAY_MS + index * APPEAR_DELAY_MS);
  });

  const totalRevealTime = FIRST_CARD_DELAY_MS + cardItems.length * APPEAR_DELAY_MS;
  cardButtons.forEach((button, index) => {
    window.setTimeout(() => {
      const image = button.querySelector(".card-image");
      if (!image) return;

      image.classList.add("card-image--flipping");
      window.setTimeout(() => {
        const frontImage = image.getAttribute("data-front-image") || "";
        const frontTitle = image.getAttribute("data-front-title") || "Карта таро";
        const orientation = image.getAttribute("data-orientation");

        image.setAttribute("src", frontImage);
        image.setAttribute("alt", frontTitle);
        image.classList.remove("card-image--is-back");
        if (orientation === "reversed") {
          image.classList.add("card-image--reversed");
        }
      }, 220);

      window.setTimeout(() => {
        image.classList.remove("card-image--flipping");
      }, 460);
    }, totalRevealTime + index * FLIP_DELAY_MS);
  });

  const totalFlipTime = totalRevealTime + cardButtons.length * FLIP_DELAY_MS + 460;
  window.setTimeout(() => {
    isAnimatingCards = false;
    cardButtons.forEach((button) => {
      button.disabled = false;
      button.classList.remove("meaning-open-btn--disabled");
    });
  }, totalFlipTime);
}
