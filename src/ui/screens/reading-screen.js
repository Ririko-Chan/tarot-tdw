import { buildMeaningOverlay } from "../components/card-meaning-overlay.js";
import { renderTarotCard } from "../components/tarot-card.js";

const DEFAULT_CARD_BACK_IMAGE = "./assets/images/rider/back.webp";
const PRELOAD_TIMEOUT_MS = 1200;
const REVEAL_STAGGER_MS = 120;
const FLIP_STAGGER_MS = 150;
const FLIP_HALF_TURN_MS = 220;
const FLIP_ANIMATION_MS = 460;

function resolveCardBackImage(backImage) {
  const candidate = String(backImage || "").trim();
  if (!candidate) return DEFAULT_CARD_BACK_IMAGE;
  if (candidate.startsWith("/")) return `.${candidate}`;
  return candidate;
}

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

function preloadImages(imageSources = []) {
  const uniqueSources = Array.from(new Set(imageSources.filter(Boolean)));
  const preloadTasks = uniqueSources.map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  }));
  return Promise.allSettled(preloadTasks);
}

export function renderReadingScreen(root, reading, { onBack, onSave } = {}) {
  if (!root) return;
  const cardBackImage = resolveCardBackImage(reading?.deck?.backImage);

  const items = (reading?.cards || []).map((entry, index) => {
    const viewModel = renderTarotCard({ card: entry.card, orientation: entry.orientation });
    const isReversed = viewModel.orientation === "reversed";
    const backReversedClass = isReversed ? "card-image--back-reversed" : "";

    return `
      <li class="reading-card-item reading-card-item--hidden" data-card-index="${index}">
        <button type="button" class="meaning-open-btn meaning-open-btn--disabled" data-card-index="${index}" aria-label="Открыть трактовку карты ${escapeHtml(viewModel.title)}" disabled>
          <img
            class="card-image card-image--is-back ${backReversedClass}"
            src="${escapeHtml(cardBackImage)}"
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
  const cardImages = Array.from(root.querySelectorAll(".card-image"));
  let toastTimer;
  let isAnimatingCards = cardItems.length > 0;

  cardImages.forEach((image) => {
    image.addEventListener("error", () => {
      if (image.getAttribute("src") !== DEFAULT_CARD_BACK_IMAGE) {
        image.setAttribute("src", DEFAULT_CARD_BACK_IMAGE);
      }
    }, { once: true });
  });

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
    cardItems.forEach((item, index) => {
      window.setTimeout(() => {
        item.classList.remove("reading-card-item--hidden");
        item.classList.add("reading-card-item--visible");
      }, index * REVEAL_STAGGER_MS);
    });

    const revealDuration = cardItems.length > 0 ? ((cardItems.length - 1) * REVEAL_STAGGER_MS) : 0;
    const flipStartDelay = revealDuration + REVEAL_STAGGER_MS;

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
          image.classList.remove("card-image--back-reversed");
        }, FLIP_HALF_TURN_MS);

        window.setTimeout(() => {
          image.classList.remove("card-image--flipping");
        }, FLIP_ANIMATION_MS);
      }, flipStartDelay + (index * FLIP_STAGGER_MS));
    });

    const totalFlipTime = flipStartDelay + (Math.max(cardButtons.length - 1, 0) * FLIP_STAGGER_MS) + FLIP_ANIMATION_MS;
    window.setTimeout(() => {
      isAnimatingCards = false;
      cardButtons.forEach((button) => {
        button.disabled = false;
        button.classList.remove("meaning-open-btn--disabled");
      });
    }, totalFlipTime);
  };

  preloadImages([cardBackImage, ...(reading?.deck?.cardImages || [])]);

  Promise.race([
    preloadCardFrontImages(cardButtons),
    new Promise((resolve) => window.setTimeout(resolve, PRELOAD_TIMEOUT_MS))
  ]).finally(startAnimation);
}
