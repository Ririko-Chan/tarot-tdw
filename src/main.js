import { renderHomeScreen } from "./ui/screens/home-screen.js";
import { renderReadingScreen } from "./ui/screens/reading-screen.js";
import { renderSettingsScreen } from "./ui/screens/settings-screen.js";
import { renderHistoryScreen } from "./ui/screens/history-screen.js";
import { createReadingUseCase } from "./features/readings/create-reading.js";
import { deleteReading, getHistory, renameReading, saveReading } from "./features/history/history-repo.js";
import { getAvailableDecks } from "./features/decks/deck-service.js";
import { getSettings, saveSettings } from "./features/settings/settings-repo.js";
import { registerServiceWorker } from "./pwa/register-sw.js";

function bootstrap() {
  const root = document.getElementById("app");
  if (!root) return;

  const renderHome = () => {
    renderHomeScreen(root, {
      onSettings: () => {
        renderSettingsScreen(root, { ...getSettings(), deckOptions: getAvailableDecks() }, {
          onBack: renderHome,
          onSave: (next) => saveSettings(next)
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
