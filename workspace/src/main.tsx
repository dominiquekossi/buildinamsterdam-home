import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";

// NOTE: StrictMode intentionally omitted. Its dev-only double-invoke of effects remounts the
// IntroLoader (gsap.context + revert) and replays the one-shot intro, which both contradicts
// the "intro runs exactly once" requirement and inflates window.__introEffectRuns in dev.
// Removing it makes dev behaviour match production (single mount → single intro run).
createRoot(document.getElementById("root")!).render(<App />);
