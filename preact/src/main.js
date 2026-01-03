import { render } from "preact";
import { html } from "htm/preact";
import { App } from "./app.js";

// Register service worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}

// Render the main App component
const root = document.getElementById("app");
if (root) {
  render(html`<${App} />`, root);
}
