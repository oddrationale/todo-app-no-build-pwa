import { LitElement } from "lit";
import { SignalWatcher, html } from "@lit-labs/signals";
import { todos, updateTodo, deleteTodo } from "../state/todo.js";
import "./todo-composer.js";
import "./todo-item.js";

/**
 * TodoList component - displays the list of todos with composer
 */
export class TodoList extends SignalWatcher(LitElement) {
  // Disable Shadow DOM to use global styles (daisyUI, Tailwind)
  createRenderRoot() {
    return this;
  }

  /**
   * @param {CustomEvent<Todo>} e
   */
  _handleTodoUpdate(e) {
    updateTodo(e.detail);
  }

  /**
   * @param {CustomEvent<{ id: string }>} e
   */
  _handleTodoDelete(e) {
    deleteTodo(e.detail.id);
  }

  render() {
    return html`
      <div>
        <todo-composer></todo-composer>
        ${todos
          .get()
          .map(
            (/** @type {Todo} */ todo) => html`
              <todo-item
                .todo=${todo}
                @todo-update=${this._handleTodoUpdate}
                @todo-delete=${this._handleTodoDelete}
              ></todo-item>
            `
          )}
      </div>
    `;
  }
}

customElements.define("todo-list", TodoList);
