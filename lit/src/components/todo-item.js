import { LitElement, html, nothing } from "lit";

/**
 * TodoItem component - displays a single todo item with edit/delete functionality
 */
export class TodoItem extends LitElement {
  static properties = {
    todo: { type: Object },
    editing: { type: Boolean },
  };

  // Disable Shadow DOM to use global styles (daisyUI, Tailwind)
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    /** @type {Todo | null} */
    this.todo = null;
    /** @type {boolean} */
    this.editing = false;
  }

  _handleCheckboxClick() {
    if (!this.todo) return;
    this.dispatchEvent(
      new CustomEvent("todo-update", {
        detail: { ...this.todo, completed: !this.todo.completed },
        bubbles: true,
      })
    );
  }

  _toggleEdit() {
    this.editing = !this.editing;
  }

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  _handleEditTodo(e) {
    if (!this.todo) return;
    this.dispatchEvent(
      new CustomEvent("todo-update", {
        detail: { ...this.todo, label: e.target.value },
        bubbles: true,
      })
    );
  }

  _handleDeleteClick() {
    if (!this.todo) return;
    this.dispatchEvent(
      new CustomEvent("todo-delete", {
        detail: { id: this.todo.id },
        bubbles: true,
      })
    );
  }

  /**
   * @param {KeyboardEvent} e
   */
  _handleKeyPress(e) {
    if (e.key === "Enter") {
      this._toggleEdit();
    }
  }

  render() {
    if (!this.todo) return html``;

    return html`
      <div class="card bg-base-100 shadow-xl mb-4">
        <div class="card-body p-4">
          <div class="flex items-center gap-4">
            <input
              type="checkbox"
              class="checkbox checkbox-lg"
              id=${this.todo.id}
              .checked=${this.todo.completed}
              @change=${this._handleCheckboxClick}
            />
            <div class="flex-1 min-w-0">
              ${this.editing
                ? html`
                    <input
                      type="text"
                      class="input input-bordered w-full bg-base-200"
                      .value=${this.todo.label}
                      @input=${this._handleEditTodo}
                      @keypress=${this._handleKeyPress}
                    />
                  `
                : html`<span
                    class="text-lg break-words ${this.todo.completed
                      ? "line-through opacity-50"
                      : ""}"
                    >${this.todo.label}</span
                  >`}
            </div>
            <div class="flex gap-2">
              <button class="btn btn-ghost" @click=${this._toggleEdit}>
                ${this.editing ? "Save" : "Edit"}
              </button>
              ${!this.editing
                ? html`
                    <button
                      class="btn btn-error"
                      @click=${this._handleDeleteClick}
                    >
                      Delete
                    </button>
                  `
                : nothing}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("todo-item", TodoItem);
