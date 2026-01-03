import { loadTodos, saveTodos } from "../utils/storage.js";

/**
 * TodoStore - EventTarget-based global store for todos
 * Components subscribe in connectedCallback, unsubscribe in disconnectedCallback
 */
class TodoStore extends EventTarget {
  /** @type {Todo[]} */
  #todos = loadTodos();

  /**
   * Get a copy of all todos
   * @returns {Todo[]}
   */
  get todos() {
    return [...this.#todos];
  }

  /**
   * Persist todos to localStorage and dispatch change event
   */
  #save() {
    saveTodos(this.#todos);
    this.dispatchEvent(new Event("change"));
  }

  /**
   * Creates a new todo object with a unique ID
   * @param {string} label - The label for the new todo
   * @returns {Todo}
   */
  #createTodo(label) {
    return {
      id: crypto.randomUUID(),
      label,
      completed: false,
    };
  }

  /**
   * Adds a new todo to the list
   * @param {string} label - The label for the new todo
   */
  addTodo(label) {
    this.#todos.push(this.#createTodo(label));
    this.#save();
  }

  /**
   * Updates a todo in the list
   * @param {Todo} updatedTodo - The updated todo
   */
  updateTodo(updatedTodo) {
    this.#todos = this.#todos.map((todo) =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    );
    this.#save();
  }

  /**
   * Deletes a todo from the list
   * @param {string} id - The id of the todo to delete
   */
  deleteTodo(id) {
    this.#todos = this.#todos.filter((todo) => todo.id !== id);
    this.#save();
  }
}

/** Global singleton store instance */
export const todoStore = new TodoStore();
