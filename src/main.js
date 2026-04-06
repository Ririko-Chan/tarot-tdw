import { renderHomeScreen } from "./ui/screens/home-screen.js";
import { renderReadingScreen } from "./ui/screens/reading-screen.js";
import { renderSettingsScreen } from "./ui/screens/settings-screen.js";
import { renderHistoryScreen } from "./ui/screens/history-screen.js";
import { createReadingUseCase } from "./features/readings/create-reading.js";
import { deleteReading, getHistory, renameReading, saveReading } from "./features/history/history-repo.js";
import { getAvailableDecks, getDeck } from "./features/decks/deck-service.js";
import { getSettings, saveSettings } from "./features/settings/settings-repo.js";
import { registerServiceWorker } from "./pwa/register-sw.js";


const preloadedImageSources = new Set();


function normalizeImagePath(imagePath) {
  const candidate = String(imagePath || "").trim();
  if (!candidate) return "";
  if (candidate.startsWith("/")) return `.${candidate}`;
  return candidate;
}

function preloadImages(imageSources = []) {
  const uniqueSources = Array.from(new Set(imageSources.map(normalizeImagePath).filter(Boolean)));
  uniqueSources.forEach((src) => {
    if (preloadedImageSources.has(src)) return;
    preloadedImageSources.add(src);
    const image = new Image();
    image.src = src;
  });
}

function warmupDeckImages() {
  const { deckId } = getSettings();
  const deck = getDeck(deckId);
  preloadImages([deck?.backImage, ...(deck?.cards || []).map((card) => card.image)]);
}
function bootstrap() {
  const root = document.getElementById("app");
  if (!root) return;

  const renderHome = () => {
    warmupDeckImages();

    renderHomeScreen(root, {
      onSettings: () => {
        renderSettingsScreen(root, { ...getSettings(), deckOptions: getAvailableDecks() }, {
          onBack: renderHome,
          onSave: (next) => {
            saveSettings(next);
            warmupDeckImages();
          }
        });
      },
      onHistory: () => {
        const renderHistory = () => {
          renderHistoryScreen(root, getHistory(), {
            onBack: renderHome,
            onDelete: (id) => {
              deleteReading(id);
              renderHistory();
            },
            onRename: (id, name) => {
              renameReading(id, name);
              renderHistory();
            }
          });
        };

        renderHistory();
      },
      onDraw: ({ cardCount = 1, question = "", context = "general", spreadId = "free-1-24" } = {}) => {
        const reading = createReadingUseCase({
          question: question || "Что важно сейчас?",
          context,
          cardCount,
          spreadId
        });

        renderReadingScreen(root, reading, {
          onBack: renderHome,
          onSave: (value) => saveReading(value)
        });
      }
    });
  };

  renderHome();
  registerServiceWorker();
}

bootstrap();
