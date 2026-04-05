export function renderHomeScreen(root, { onDraw } = {}) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <h1>Tarot TDW</h1>
      <p>Выберите количество карт и начните расклад.</p>
      <label for="card-count">Количество карт: <strong id="card-count-value">1</strong></label>
      <input id="card-count" type="range" min="1" max="7" step="1" value="1" />
      <button id="draw-btn">Вытянуть</button>
    </section>
  `;

  const cardCountInput = root.querySelector("#card-count");
  const cardCountValue = root.querySelector("#card-count-value");

  cardCountInput?.addEventListener("input", () => {
    if (!cardCountValue) return;
    cardCountValue.textContent = cardCountInput.value;
  });

  root.querySelector("#draw-btn")?.addEventListener("click", () => {
    const cardCount = Number(cardCountInput?.value) || 1;
    onDraw?.({ cardCount });
  });
}
