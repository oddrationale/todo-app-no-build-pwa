import { signal } from "@lit-labs/signals";
import { loadTodos, saveTodos } from "../utils/storage.js";

/**
 * Global todos signal - contains the list of all todos
 * @type {import("@lit-labs/signals").State<Todo[]>}
 */
export const todos = signal(loadTodos());

/**
 * Persist todos to localStorage
 * Call this after any mutation to the todos signal
 */
function persistTodos() {
  saveTodos(todos.get());
}

/**
 * Creates a new todo object with a unique ID
 * @param {string} label - The label for the new todo
 * @returns {Todo}
 */
function createTodo(label) {
  return {
    id: crypto.randomUUID(),
    label,
    completed: false,
  };
}

/**
 * Updates a todo in the list
 * @param {Todo} updatedTodo - The updated todo
 */
export function updateTodo(updatedTodo) {
  todos.set(
    todos
      .get()
      .map((/** @type {Todo} */ todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
  );
  persistTodos();
}

/**
 * Deletes a todo from the list
 * @param {string} id - The id of the todo to delete
 */
export function deleteTodo(id) {
  todos.set(todos.get().filter((/** @type {Todo} */ todo) => todo.id !== id));
  persistTodos();
}

/**
 * Adds a new todo to the list
 * @param {string} label - The label for the new todo
 */
export function addTodo(label) {
  todos.set([...todos.get(), createTodo(label)]);
  persistTodos();
}
