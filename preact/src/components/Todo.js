import { html } from "htm/preact";
import { useSignal } from "@preact/signals";

/**
 * Todo component - displays a single todo item with edit/delete functionality
 * @param {Object} props
 * @param {Todo} props.todo - The todo item to display
 * @param {(todo: Todo) => void} props.onUpdate - Callback to update the todo
 * @param {(id: string) => void} props.onDelete - Callback to delete the todo
 */
export default function TodoItem({ todo, onUpdate, onDelete }) {
  const editing = useSignal(false);

  const handleCheckboxClick = () => {
    onUpdate({
      ...todo,
      completed: !todo.completed,
    });
  };

  const toggleEdit = () => {
    editing.value = !editing.value;
  };

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  const handleEditTodo = (e) => {
    onUpdate({
      ...todo,
      label: e.target.value,
    });
  };

  const handleDeleteClick = () => {
    onDelete(todo.id);
  };

  return html`
    <div class="card bg-base-100 shadow-xl mb-4">
      <div class="card-body p-4">
        <div class="flex items-center gap-4">
          <input
            type="checkbox"
            class="checkbox checkbox-lg"
            id=${todo.id}
            checked=${todo.completed}
            onChange=${handleCheckboxClick}
          />
          <div class="flex-1 min-w-0">
            ${editing.value
              ? html`
                  <input
                    type="text"
                    class="input input-bordered w-full bg-base-200"
                    value=${todo.label}
                    onInput=${handleEditTodo}
                    onKeyPress=${(/** @type {KeyboardEvent} */ e) =>
                      e.key === "Enter" && toggleEdit()}
                  />
                `
              : html`<span
                  class="text-lg break-words ${todo.completed
                    ? "line-through opacity-50"
                    : ""}"
                  >${todo.label}</span
                >`}
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost" onClick=${toggleEdit}>
              ${editing.value ? "Save" : "Edit"}
            </button>
            ${!editing.value &&
            html`
              <button class="btn btn-error" onClick=${handleDeleteClick}>
                Delete
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}
