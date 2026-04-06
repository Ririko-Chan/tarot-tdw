import { renderHomeScreen } from "./ui/screens/home-screen.js";
import { renderReadingScreen } from "./ui/screens/reading-screen.js";
import { renderSettingsScreen } from "./ui/screens/settings-screen.js";
import { createReadingUseCase } from "./features/readings/create-reading.js";
import { saveReading } from "./features/history/history-repo.js";
import { getSettings, saveSettings } from "./features/settings/settings-repo.js";
import { registerServiceWorker } from "./pwa/register-sw.js";

function bootstrap() {
  const root = document.getElementById("app");
  if (!root) return;

  const renderHome = () => {
    renderHomeScreen(root, {
      onSettings: () => {
        renderSettingsScreen(root, getSettings(), {
          onBack: renderHome,
          onSave: (next) => saveSettings(next)
        });
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
