import { html } from "htm/preact";
import Todo from "./Todo.js";
import TodoComposer from "./TodoComposer.js";
import { todos, updateTodo, deleteTodo } from "../state/todo.js";

/**
 * TodoList component - displays the list of todos with composer
 */
export default function TodoList() {
  return html`
    <div>
      <${TodoComposer} />
      ${todos.value.map(
        (/** @type {Todo} */ todo) => html`
          <${Todo}
            key=${todo.id}
            todo=${todo}
            onUpdate=${updateTodo}
            onDelete=${deleteTodo}
          />
        `
      )}
    </div>
  `;
}
