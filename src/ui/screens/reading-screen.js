import { buildMeaningOverlay } from "../components/card-meaning-overlay.js";
import { renderTarotCard } from "../components/tarot-card.js";

const CARD_BACK_IMAGE = "./assets/images/rider/back.webp";
const APPEAR_DELAY_MS = 180;
const FLIP_DELAY_MS = 180;
const FIRST_CARD_DELAY_MS = 120;
const PRELOAD_TIMEOUT_MS = 1200;
const MAX_REVEAL_STAGE_MS = 1200;
const MAX_FLIP_STAGE_MS = 1200;

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

function preloadCardFrontImages(cardButtons = []) {
  const uniqueSources = Array.from(new Set(
    cardButtons
      .map((button) => button.querySelector(".card-image")?.getAttribute("data-front-image") || "")
      .filter(Boolean)
  ));

  const preloadTasks = uniqueSources.map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  }));

  return Promise.allSettled(preloadTasks);
}

function resolveStepDelay(baseStep, count, maxStageMs) {
  const safeCount = Math.max(1, count);
  const adaptiveStep = Math.floor(maxStageMs / safeCount);
  return Math.max(40, Math.min(baseStep, adaptiveStep));
}

export function renderReadingScreen(root, reading, { onBack, onSave } = {}) {
  if (!root) return;

  const items = (reading?.cards || []).map((entry, index) => {
    const viewModel = renderTarotCard({ card: entry.card, orientation: entry.orientation });
    const reversedClass = viewModel.orientation === "reversed" ? "card-image--reversed" : "";

    return `
      <li class="reading-card-item reading-card-item--hidden" data-card-index="${index}">
        <button type="button" class="meaning-open-btn meaning-open-btn--disabled" data-card-index="${index}" aria-label="Открыть трактовку карты ${escapeHtml(viewModel.title)}" disabled>
          <img
            class="card-image card-image--is-back ${reversedClass}"
            src="${CARD_BACK_IMAGE}"
            alt="Рубашка карты"
            loading="lazy"
            data-front-image="${escapeHtml(viewModel.image)}"
            data-front-title="${escapeHtml(viewModel.title)}"
          />
        </button>
      </li>
    `;
  }).join("");

  const spreadTitle = reading?.spread?.name ? `<p><strong>Расклад:</strong> ${escapeHtml(reading.spread.name)}</p>` : "";
  const hint = reading?.hint ? `<p><strong>Подсказка колоды:</strong> ${escapeHtml(reading.hint)}</p>` : "";
  const contextNote = reading?.requestedContext && reading?.requestedContext !== reading?.context
    ? `<p><strong>Контекст скорректирован:</strong> использован ${escapeHtml(reading.context)} вместо ${escapeHtml(reading.requestedContext)}.</p>`
    : "";

  root.innerHTML = `
    <section>
      <div class="screen-header">
        <button id="reading-back-btn" type="button" class="secondary-btn">← Назад</button>
        <h2>Расклад</h2>
      </div>
      <p><strong>Вопрос:</strong> ${escapeHtml(reading?.question || "—")}</p>
      ${spreadTitle}
      ${contextNote}
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

  const startAnimation = () => {
    const appearStepMs = resolveStepDelay(APPEAR_DELAY_MS, cardItems.length, MAX_REVEAL_STAGE_MS);
    const flipStepMs = resolveStepDelay(FLIP_DELAY_MS, cardButtons.length, MAX_FLIP_STAGE_MS);
    const firstCardDelayMs = Math.min(FIRST_CARD_DELAY_MS, appearStepMs);

    cardItems.forEach((item, index) => {
      window.setTimeout(() => {
        item.classList.remove("reading-card-item--hidden");
        item.classList.add("reading-card-item--visible");
      }, firstCardDelayMs + index * appearStepMs);
    });

    const totalRevealTime = firstCardDelayMs + cardItems.length * appearStepMs;
    cardButtons.forEach((button, index) => {
      window.setTimeout(() => {
        const image = button.querySelector(".card-image");
        if (!image) return;

        image.classList.add("card-image--flipping");
        window.setTimeout(() => {
          const frontImage = image.getAttribute("data-front-image") || "";
          const frontTitle = image.getAttribute("data-front-title") || "Карта таро";

          image.setAttribute("src", frontImage);
          image.setAttribute("alt", frontTitle);
          image.classList.remove("card-image--is-back");
        }, 220);

        window.setTimeout(() => {
          image.classList.remove("card-image--flipping");
        }, 460);
      }, totalRevealTime + index * flipStepMs);
    });

    const totalFlipTime = totalRevealTime + cardButtons.length * flipStepMs + 460;
    window.setTimeout(() => {
      isAnimatingCards = false;
      cardButtons.forEach((button) => {
        button.disabled = false;
        button.classList.remove("meaning-open-btn--disabled");
      });
    }, totalFlipTime);
  };

  Promise.race([
    preloadCardFrontImages(cardButtons),
    new Promise((resolve) => window.setTimeout(resolve, PRELOAD_TIMEOUT_MS))
  ]).finally(startAnimation);
}
