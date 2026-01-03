/**
 * TodoComposer component - input field for adding new todos
 */
class TodoComposer extends HTMLElement {
  /** @type {string} */
  #label = "";

  connectedCallback() {
    if (this.querySelector(".card")) return; // Guard against re-entry
    this.render();
  }

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  _handleUpdateLabel(e) {
    this.#label = e.target.value;
    this._updateButtonState();
  }

  _handleAddTodoClick() {
    if (!this.#label.trim()) return;
    this.dispatchEvent(
      new CustomEvent("add-todo", {
        detail: { label: this.#label },
        bubbles: true,
      })
    );
    this.#label = "";
    this._updateInput();
  }

  /**
   * @param {KeyboardEvent} e
   */
  _handleKeyPress(e) {
    if (e.key === "Enter") {
      this._handleAddTodoClick();
    }
  }

  _updateButtonState() {
    const button = /** @type {HTMLButtonElement | null} */ (
      this.querySelector("button")
    );
    if (button) {
      button.disabled = !this.#label.trim();
    }
  }

  _updateInput() {
    const input = /** @type {HTMLInputElement | null} */ (
      this.querySelector("input")
    );
    if (input) {
      input.value = this.#label;
      input.focus();
    }
    this._updateButtonState();
  }

  _bindEvents() {
    const input = this.querySelector("input");
    const button = this.querySelector("button");

    input?.addEventListener("input", (e) =>
      this._handleUpdateLabel(
        /** @type {Event & { target: HTMLInputElement }} */ (e)
      )
    );
    input?.addEventListener("keypress", (e) =>
      this._handleKeyPress(/** @type {KeyboardEvent} */ (e))
    );
    button?.addEventListener("click", () => this._handleAddTodoClick());
  }

  render() {
    this.innerHTML = `
      <div class="card bg-base-100 shadow-xl mb-4">
        <div class="card-body p-4">
          <div class="flex gap-2 items-center">
            <input
              placeholder="Add a new todo"
              type="text"
              class="input input-bordered flex-1 bg-base-200"
              value=""
            />
            <button
              class="btn btn-warning text-base-100 font-semibold"
              disabled
            >
              Add Todo
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }
}

/**
 * Register the todo-composer custom element
 */
export const registerTodoComposer = () =>
  customElements.define("todo-composer", TodoComposer);
