import { todoStore } from "../state/todo.js";

/**
 * TodoList component - displays the list of todos with composer
 */
class TodoList extends HTMLElement {
  /** @type {() => void} */
  #handleChange;

  constructor() {
    super();
    this.#handleChange = () => this.update();
  }

  connectedCallback() {
    if (this.querySelector("todo-composer")) return; // Guard against re-entry
    this.render();
    todoStore.addEventListener("change", this.#handleChange);
  }

  disconnectedCallback() {
    todoStore.removeEventListener("change", this.#handleChange);
  }

  /**
   * @param {CustomEvent<Todo>} e
   */
  _handleTodoUpdate(e) {
    todoStore.updateTodo(e.detail);
  }

  /**
   * @param {CustomEvent<{ id: string }>} e
   */
  _handleTodoDelete(e) {
    todoStore.deleteTodo(e.detail.id);
  }

  /**
   * @param {CustomEvent<{ label: string }>} e
   */
  _handleTodoAdd(e) {
    todoStore.addTodo(e.detail.label);
  }

  _bindEvents() {
    this.addEventListener("add-todo", (e) =>
      this._handleTodoAdd(/** @type {CustomEvent<{ label: string }>} */ (e))
    );
    this.addEventListener("todo-update", (e) =>
      this._handleTodoUpdate(/** @type {CustomEvent<Todo>} */ (e))
    );
    this.addEventListener("todo-delete", (e) =>
      this._handleTodoDelete(/** @type {CustomEvent<{ id: string }>} */ (e))
    );
  }

  render() {
    this.innerHTML = `
      <todo-composer></todo-composer>
      <div class="todo-items"></div>
    `;

    this._bindEvents();
    this.update();
  }

  update() {
    const container = this.querySelector(".todo-items");
    if (!container) return;

    const todos = todoStore.todos;
    const existingItems = container.querySelectorAll("todo-item");

    // Create a map of existing items by id
    /** @type {Map<string, HTMLElement>} */
    const existingMap = new Map();
    existingItems.forEach((item) => {
      const todoItem = /** @type {TodoItemElement} */ (item);
      if (todoItem.todo?.id) {
        existingMap.set(todoItem.todo.id, todoItem);
      }
    });

    // Remove items that no longer exist
    existingItems.forEach((item) => {
      const todoItem = /** @type {TodoItemElement} */ (item);
      if (!todos.find((t) => t.id === todoItem.todo?.id)) {
        item.remove();
      }
    });

    // Add or update items
    todos.forEach((todo) => {
      let item = existingMap.get(todo.id);
      if (item) {
        // Update existing item
        const todoItem = /** @type {TodoItemElement} */ (item);
        todoItem.todo = todo;
      } else {
        // Create new item
        const newItem = /** @type {TodoItemElement} */ (
          document.createElement("todo-item")
        );
        newItem.todo = todo;
        container.appendChild(newItem);
      }
    });
  }
}

/**
 * Register the todo-list custom element
 */
export const registerTodoList = () =>
  customElements.define("todo-list", TodoList);
