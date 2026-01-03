/**
 * TodoItem component - displays a single todo item with edit/delete functionality
 */
class TodoItem extends HTMLElement {
  /** @type {Todo | null} */
  #todo = null;

  /** @type {boolean} */
  #editing = false;

  /**
   * Get the todo item
   * @returns {Todo | null}
   */
  get todo() {
    return this.#todo;
  }

  /**
   * Set the todo item and update UI
   * @param {Todo | null} value
   */
  set todo(value) {
    this.#todo = value;
    if (this.querySelector(".card")) {
      this.update();
    } else {
      this.render();
    }
  }

  /**
   * Get editing state
   * @returns {boolean}
   */
  get editing() {
    return this.#editing;
  }

  /**
   * Set editing state and update UI
   * @param {boolean} value
   */
  set editing(value) {
    this.#editing = value;
    this.update();
  }

  connectedCallback() {
    if (this.querySelector(".card")) return; // Guard against re-entry
    this.render();
  }

  /**
   * Escapes HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  _escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  _handleCheckboxChange() {
    if (!this.#todo) return;
    this.dispatchEvent(
      new CustomEvent("todo-update", {
        detail: { ...this.#todo, completed: !this.#todo.completed },
        bubbles: true,
      })
    );
  }

  _toggleEdit() {
    this.editing = !this.#editing;
  }

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  _handleEditTodo(e) {
    if (!this.#todo) return;
    this.dispatchEvent(
      new CustomEvent("todo-update", {
        detail: { ...this.#todo, label: e.target.value },
        bubbles: true,
      })
    );
  }

  _handleDeleteClick() {
    if (!this.#todo) return;
    this.dispatchEvent(
      new CustomEvent("todo-delete", {
        detail: { id: this.#todo.id },
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

  _bindEvents() {
    const checkbox = this.querySelector('input[type="checkbox"]');
    const editInput = this.querySelector('input[type="text"]');
    const editBtn = this.querySelector(".btn-edit");
    const deleteBtn = this.querySelector(".btn-delete");

    checkbox?.addEventListener("change", () => this._handleCheckboxChange());
    editInput?.addEventListener("input", (e) =>
      this._handleEditTodo(
        /** @type {Event & { target: HTMLInputElement }} */ (e)
      )
    );
    editInput?.addEventListener("keypress", (e) =>
      this._handleKeyPress(/** @type {KeyboardEvent} */ (e))
    );
    editBtn?.addEventListener("click", () => this._toggleEdit());
    deleteBtn?.addEventListener("click", () => this._handleDeleteClick());
  }

  render() {
    if (!this.#todo) {
      this.innerHTML = "";
      return;
    }

    const completedClass = this.#todo.completed
      ? "line-through opacity-50"
      : "";

    this.innerHTML = `
      <div class="card bg-base-100 shadow-xl mb-4">
        <div class="card-body p-4">
          <div class="flex items-center gap-4">
            <input
              type="checkbox"
              class="checkbox checkbox-lg"
              id="${this.#todo.id}"
              ${this.#todo.completed ? "checked" : ""}
            />
            <div class="flex-1 min-w-0">
              <span class="text-lg break-words label-display ${completedClass}">${this._escapeHtml(
      this.#todo.label
    )}</span>
              <input
                type="text"
                class="input input-bordered w-full bg-base-200 label-edit hidden"
                value="${this._escapeHtml(this.#todo.label)}"
              />
            </div>
            <div class="flex gap-2">
              <button class="btn btn-ghost btn-edit">Edit</button>
              <button class="btn btn-error btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this.update();
  }

  update() {
    if (!this.#todo) return;

    const checkbox = /** @type {HTMLInputElement | null} */ (
      this.querySelector('input[type="checkbox"]')
    );
    const labelDisplay = this.querySelector(".label-display");
    const labelEdit = /** @type {HTMLInputElement | null} */ (
      this.querySelector(".label-edit")
    );
    const editBtn = this.querySelector(".btn-edit");
    const deleteBtn = this.querySelector(".btn-delete");

    if (!checkbox || !labelDisplay || !labelEdit || !editBtn) return;

    // Update checkbox state
    checkbox.checked = this.#todo.completed;

    // Update label styling based on completion
    if (this.#todo.completed) {
      labelDisplay.classList.add("line-through", "opacity-50");
    } else {
      labelDisplay.classList.remove("line-through", "opacity-50");
    }

    // Toggle edit mode
    if (this.#editing) {
      labelDisplay.classList.add("hidden");
      labelEdit.classList.remove("hidden");
      labelEdit.value = this.#todo.label;
      labelEdit.focus();
      editBtn.textContent = "Save";
      deleteBtn?.classList.add("hidden");
    } else {
      labelDisplay.classList.remove("hidden");
      labelEdit.classList.add("hidden");
      labelDisplay.textContent = this.#todo.label;
      editBtn.textContent = "Edit";
      deleteBtn?.classList.remove("hidden");
    }
  }
}

/**
 * Register the todo-item custom element
 */
export const registerTodoItem = () =>
  customElements.define("todo-item", TodoItem);
