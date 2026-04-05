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

        <label for="spread-select">Тип расклада</label>
        <select id="spread-select" name="spreadId">
          <option value="free-1-24">Свободный (1-24)</option>
          <option value="horseshoe">Подкова (7 карт)</option>
        </select>

        <menu>
          <button value="cancel" type="button" id="cancel-draw-btn">Отмена</button>
          <button value="confirm" type="submit">Сделать расклад</button>
        </menu>
      </form>
    </dialog>
  `;
}

export function renderHomeScreen(root, { onDraw } = {}) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <h1>Tarot TDW</h1>
      <p>Выберите количество карт и начните расклад.</p>
      <label for="card-count">Количество карт: <strong id="card-count-value">1</strong></label>
      <input id="card-count" type="range" min="1" max="24" step="1" value="1" />
      <button id="draw-btn">Вытянуть</button>
      ${buildPreDrawModal()}
    </section>
  `;

  const cardCountInput = root.querySelector("#card-count");
  const cardCountValue = root.querySelector("#card-count-value");
  const modal = root.querySelector("#pre-draw-modal");
  const form = root.querySelector("#pre-draw-form");
  const cancelBtn = root.querySelector("#cancel-draw-btn");

  const updateCardCountUi = () => {
    if (!cardCountValue || !cardCountInput) return;
    cardCountValue.textContent = cardCountInput.value;
  };

  const applySpreadRules = () => {
    if (!form || !cardCountInput) return;
    const spreadSelect = form.querySelector("#spread-select");
    if (spreadSelect?.value === "horseshoe") {
      cardCountInput.value = "7";
      cardCountInput.disabled = true;
    } else {
      cardCountInput.disabled = false;
    }
    updateCardCountUi();
  };

  cardCountInput?.addEventListener("input", updateCardCountUi);
  form?.querySelector("#spread-select")?.addEventListener("change", applySpreadRules);

  root.querySelector("#draw-btn")?.addEventListener("click", () => {
    if (typeof modal?.showModal === "function") {
      applySpreadRules();
      modal.showModal();
      return;
    }

    const fallbackQuestion = window.prompt("Введите вопрос", "") || "";
    const fallbackContext = window.prompt("Тема (general/relationships/career/advice)", "general") || "general";
    onDraw?.({
      cardCount: Number(cardCountInput?.value) || 1,
      question: fallbackQuestion.trim(),
      context: fallbackContext,
      spreadId: "free-1-24"
    });
  });

  cancelBtn?.addEventListener("click", () => {
    modal?.close("cancel");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const questionInput = form.querySelector("#question-input");
    const contextSelect = form.querySelector("#context-select");
    const spreadSelect = form.querySelector("#spread-select");

    onDraw?.({
      cardCount: Number(cardCountInput?.value) || 1,
      question: questionInput?.value?.trim() || "",
      context: contextSelect?.value || "general",
      spreadId: spreadSelect?.value || "free-1-24"
    });

    modal?.close("confirm");
  });

  updateCardCountUi();
}
