import { renderHomeScreen } from "./ui/screens/home-screen.js";
import { renderReadingScreen } from "./ui/screens/reading-screen.js";
import { createReadingUseCase } from "./features/readings/create-reading.js";
import { saveReading } from "./features/history/history-repo.js";
import { registerServiceWorker } from "./pwa/register-sw.js";

function bootstrap() {
  const root = document.getElementById("app");
  if (!root) return;

  renderHomeScreen(root, {
    onDraw: ({ cardCount = 1, question = "", context = "general", spreadId = "free-1-24" } = {}) => {
      const reading = createReadingUseCase({
        question: question || "Что важно сейчас?",
        context,
        cardCount,
        spreadId
      });

      saveReading(reading);
      renderReadingScreen(root, reading);
    }
  });

  registerServiceWorker();
}

bootstrap();
