import { html } from "htm/preact";
import TodoList from "./components/TodoList.js";

export function App() {
  return html`
    <section class="min-h-screen p-6">
      <div class="max-w-2xl mx-auto space-y-4">
        <${TodoList} />
      </div>
    </section>
  `;
}
