import { LitElement, html } from "lit";
import "./todo-list.js";

/**
 * TodoApp component - main application container
 */
export class TodoApp extends LitElement {
  // Disable Shadow DOM to use global styles (daisyUI, Tailwind)
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <section class="min-h-screen p-6">
        <div class="max-w-2xl mx-auto space-y-4">
          <todo-list></todo-list>
        </div>
      </section>
    `;
  }
}

customElements.define("todo-app", TodoApp);
