const STORAGE_KEY = "preact-todos";

/**
 * Load todos from localStorage
 * @returns {TodoList}
 */
export function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load todos from localStorage:", e);
  }
  return [];
}

/**
 * Save todos to localStorage
 * @param {TodoList} todos
 */
export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error("Failed to save todos to localStorage:", e);
  }
}
