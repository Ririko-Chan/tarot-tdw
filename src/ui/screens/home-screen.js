function buildPreDrawModal() {
  return `
    <dialog id="pre-draw-modal">
      <form method="dialog" id="pre-draw-form" class="pre-draw-form">
        <h2>Параметры расклада</h2>

        <label for="question-input">Ваш вопрос (необязательно)</label>
        <textarea id="question-input" name="question" rows="3" placeholder="Например: что поможет мне в ближайший месяц?"></textarea>

        <label for="context-select">Тема расклада</label>
        <select id="context-select" name="context">
          <option value="general">Общий</option>
          <option value="relationships">Отношения</option>
          <option value="career">Карьера</option>
          <option value="advice">Совет</option>
        </select>

        <menu>
          <button value="cancel" type="button" id="cancel-draw-btn">Отмена</button>
          <button value="confirm" type="submit">Сделать расклад</button>
        </menu>
      </form>
    </dialog>
  `;
}

function buildPresetButtons() {
  return `
    <div class="spread-presets">
      <p class="spread-presets__label">Готовые расклады:</p>
      <div class="spread-presets__buttons" role="group" aria-label="Готовые расклады">
        <button type="button" class="spread-preset-btn is-active" data-spread-id="free-1-24">Свободный</button>
        <button type="button" class="spread-preset-btn" data-spread-id="horseshoe">Подкова (7)</button>
      </div>
    </div>
  `;
}

export function renderHomeScreen(root, { onDraw, onSettings } = {}) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <div class="home-header">
        <h1>Tarot TDW</h1>
        <button id="open-settings-btn" type="button" class="secondary-btn">Настройки</button>
      </div>
      <p>Выберите количество карт и начните расклад.</p>
      <label for="card-count">Количество карт: <strong id="card-count-value">1</strong></label>
      <input id="card-count" type="range" min="1" max="24" step="1" value="1" />
      <button id="draw-btn">Вытянуть</button>
      ${buildPresetButtons()}
      ${buildPreDrawModal()}
    </section>
  `;

  const cardCountInput = root.querySelector("#card-count");
  const cardCountValue = root.querySelector("#card-count-value");
  const modal = root.querySelector("#pre-draw-modal");
  const form = root.querySelector("#pre-draw-form");
  const cancelBtn = root.querySelector("#cancel-draw-btn");
  const spreadButtons = Array.from(root.querySelectorAll(".spread-preset-btn"));

  let selectedSpreadId = "free-1-24";

  const updateCardCountUi = () => {
    if (!cardCountValue || !cardCountInput) return;
    cardCountValue.textContent = cardCountInput.value;
  };

  const applySpreadRules = () => {
    if (!cardCountInput) return;

    if (selectedSpreadId === "horseshoe") {
      cardCountInput.value = "7";
      cardCountInput.disabled = true;
    } else {
      cardCountInput.disabled = false;
    }

    spreadButtons.forEach((button) => {
      const isActive = button.getAttribute("data-spread-id") === selectedSpreadId;
      button.classList.toggle("is-active", isActive);
    });

    updateCardCountUi();
  };

  spreadButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedSpreadId = button.getAttribute("data-spread-id") || "free-1-24";
      applySpreadRules();
    });
  });

  cardCountInput?.addEventListener("input", updateCardCountUi);

  root.querySelector("#open-settings-btn")?.addEventListener("click", () => {
    onSettings?.();
  });

  root.querySelector("#draw-btn")?.addEventListener("click", () => {
    if (typeof modal?.showModal === "function") {
      modal.showModal();
      return;
    }

    const fallbackQuestion = window.prompt("Введите вопрос", "") || "";
    const fallbackContext = window.prompt("Тема (general/relationships/career/advice)", "general") || "general";
    onDraw?.({
      cardCount: Number(cardCountInput?.value) || 1,
      question: fallbackQuestion.trim(),
      context: fallbackContext,
      spreadId: selectedSpreadId
    });
  });

  cancelBtn?.addEventListener("click", () => {
    modal?.close("cancel");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const questionInput = form.querySelector("#question-input");
    const contextSelect = form.querySelector("#context-select");

    onDraw?.({
      cardCount: Number(cardCountInput?.value) || 1,
      question: questionInput?.value?.trim() || "",
      context: contextSelect?.value || "general",
      spreadId: selectedSpreadId
    });

    modal?.close("confirm");
  });

  applySpreadRules();
}
