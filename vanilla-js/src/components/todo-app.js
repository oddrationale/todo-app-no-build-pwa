/**
 * TodoApp component - main application container
 */
class TodoApp extends HTMLElement {
  connectedCallback() {
    if (this.querySelector("section")) return; // Guard against re-entry
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="min-h-screen p-6">
        <div class="max-w-2xl mx-auto space-y-4">
          <todo-list></todo-list>
        </div>
      </section>
    `;
  }
}

/**
 * Register the todo-app custom element
 */
export const registerTodoApp = () => customElements.define("todo-app", TodoApp);
