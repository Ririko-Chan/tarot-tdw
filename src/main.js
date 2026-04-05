import { renderHomeScreen } from "./src/ui/screens/home-screen.js";
import { renderReadingScreen } from "./src/ui/screens/reading-screen.js";
import { createReadingUseCase } from "./src/features/readings/create-reading.js";
import { registerServiceWorker } from "./src/pwa/register-sw.js";

function bootstrap() {
  const root = document.getElementById("app");
  if (!root) return;

  renderHomeScreen(root, {
    onDraw: () => {
      const reading = createReadingUseCase({
        question: "Что важно сейчас?",
        context: "general",
        cardCount: 1
      });

      renderReadingScreen(root, reading);
    }
  });

  registerServiceWorker();
}

bootstrap();
