export function renderHistoryScreen(root, history = []) {
  if (!root) return;
  root.innerHTML = `
    <section>
      <h2>История</h2>
      <ol>
        ${history.map((item) => `<li>${item.name || item.question || item.id}</li>`).join("")}
      </ol>
    </section>
  `;
}
