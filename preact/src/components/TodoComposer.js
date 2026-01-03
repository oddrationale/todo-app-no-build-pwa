import { html } from "htm/preact";
import { useSignal } from "@preact/signals";
import { addTodo } from "../state/todo.js";

/**
 * TodoComposer component - input field for adding new todos
 */
export default function TodoComposer() {
  const label = useSignal("");

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  const handleUpdateLabel = (e) => {
    label.value = e.target.value;
  };

  const handleAddTodoClick = () => {
    if (!label.value.trim()) return;
    addTodo(label.value);
    label.value = "";
  };

  return html`
    <div class="card bg-base-100 shadow-xl mb-4">
      <div class="card-body p-4">
        <div class="flex gap-2 items-center">
          <input
            placeholder="Add a new todo"
            type="text"
            class="input input-bordered flex-1 bg-base-200"
            value=${label.value}
            onInput=${handleUpdateLabel}
            onKeyPress=${(/** @type {KeyboardEvent} */ e) =>
              e.key === "Enter" && handleAddTodoClick()}
          />
          <button
            class="btn btn-warning text-base-100 font-semibold"
            onClick=${handleAddTodoClick}
            disabled=${!label.value.trim()}
          >
            Add Todo
          </button>
        </div>
      </div>
    </div>
  `;
}
