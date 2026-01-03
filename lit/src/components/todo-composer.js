import { LitElement, html } from "lit";
import { addTodo } from "../state/todo.js";

/**
 * TodoComposer component - input field for adding new todos
 */
export class TodoComposer extends LitElement {
  static properties = {
    label: { type: String },
  };

  // Disable Shadow DOM to use global styles (daisyUI, Tailwind)
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    /** @type {string} */
    this.label = "";
  }

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  _handleUpdateLabel(e) {
    this.label = e.target.value;
  }

  _handleAddTodoClick() {
    if (!this.label.trim()) return;
    addTodo(this.label);
    this.label = "";
  }

  /**
   * @param {KeyboardEvent} e
   */
  _handleKeyPress(e) {
    if (e.key === "Enter") {
      this._handleAddTodoClick();
    }
  }

  render() {
    return html`
      <div class="card bg-base-100 shadow-xl mb-4">
        <div class="card-body p-4">
          <div class="flex gap-2 items-center">
            <input
              placeholder="Add a new todo"
              type="text"
              class="input input-bordered flex-1 bg-base-200"
              .value=${this.label}
              @input=${this._handleUpdateLabel}
              @keypress=${this._handleKeyPress}
            />
            <button
              class="btn btn-warning text-base-100 font-semibold"
              @click=${this._handleAddTodoClick}
              ?disabled=${!this.label.trim()}
            >
              Add Todo
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("todo-composer", TodoComposer);
