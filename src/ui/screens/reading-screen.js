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

function renderOverlayModal(overlay) {
  return `
    <dialog id="meaning-overlay" class="meaning-overlay">
      <article>
        <h3>${escapeHtml(overlay.title)}</h3>
        <p><strong>Ключевые слова:</strong> ${escapeHtml((overlay.keywords || []).join(", ") || "—")}</p>
        <p>${escapeHtml(overlay.text || "—")}</p>
        <button type="button" id="close-overlay-btn">Закрыть</button>
      </article>
    </dialog>
  `;
}

export function renderReadingScreen(root, reading) {
  if (!root) return;

  const items = (reading?.cards || []).map((entry, index) => {
    const viewModel = renderTarotCard({ card: entry.card, orientation: entry.orientation });
    const reversedClass = viewModel.orientation === "reversed" ? "card-image--reversed" : "";
    const position = entry.position ? `<p><em>${escapeHtml(entry.position)}</em></p>` : "";

    return `
      <li class="reading-card-item" data-card-index="${index}">
        <button type="button" class="meaning-open-btn" data-card-index="${index}">
          <img class="card-image ${reversedClass}" src="${escapeHtml(viewModel.image)}" alt="${escapeHtml(viewModel.title)}" loading="lazy" />
        </button>
        <div>
          <strong>${escapeHtml(viewModel.title)}</strong> (${escapeHtml(viewModel.orientation)})
          ${position}
          <p>${escapeHtml(entry.meaning.text)}</p>
        </div>
      </li>
    `;
  }).join("");

  const spreadTitle = reading?.spread?.name ? `<p><strong>Расклад:</strong> ${escapeHtml(reading.spread.name)}</p>` : "";
  const hint = reading?.hint ? `<p><strong>Подсказка колоды:</strong> ${escapeHtml(reading.hint)}</p>` : "";

  root.innerHTML = `
    <section>
      <h2>Расклад</h2>
      <p><strong>Вопрос:</strong> ${escapeHtml(reading?.question || "—")}</p>
      ${spreadTitle}
      ${hint}
      <ul class="reading-list">${items}</ul>
      ${renderOverlayModal({ title: "", keywords: [], text: "" })}
    </section>
  `;

  const overlayDialog = root.querySelector("#meaning-overlay");

  root.querySelectorAll(".meaning-open-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-card-index"));
      const entry = reading?.cards?.[index];
      if (!entry || !overlayDialog) return;

      const overlay = buildMeaningOverlay(entry.meaning);
      overlayDialog.innerHTML = `
        <article>
          <h3>${escapeHtml(overlay.title)}</h3>
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
