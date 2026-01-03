import { signal, effect } from "@preact/signals";
import { loadTodos, saveTodos } from "../utils/storage.js";

/**
 * Global todos signal - contains the list of all todos
 * @type {import("@preact/signals").Signal<TodoList>}
 */
export const todos = signal(loadTodos());

// Persist todos to localStorage whenever they change
effect(() => {
  saveTodos(todos.value);
});

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
  todos.value = todos.value.map((todo) =>
    todo.id === updatedTodo.id ? updatedTodo : todo
  );
}

/**
 * Deletes a todo from the list
 * @param {string} id - The id of the todo to delete
 */
export function deleteTodo(id) {
  todos.value = todos.value.filter((todo) => todo.id !== id);
}

/**
 * Adds a new todo to the list
 * @param {string} label - The label for the new todo
 */
export function addTodo(label) {
  todos.value = [...todos.value, createTodo(label)];
}
