export function renderHomeScreen(root, { onDraw } = {}) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <h1>Tarot TDW</h1>
      <p>Выберите количество карт и начните расклад.</p>
      <button id="draw-btn">Вытянуть</button>
    </section>
  `;

  root.querySelector("#draw-btn")?.addEventListener("click", () => {
    onDraw?.();
  });
}
