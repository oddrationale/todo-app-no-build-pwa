// Import and register all components
import { registerTodoApp } from "./components/todo-app.js";
import { registerTodoList } from "./components/todo-list.js";
import { registerTodoComposer } from "./components/todo-composer.js";
import { registerTodoItem } from "./components/todo-item.js";

// Register components when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  registerTodoItem();
  registerTodoComposer();
  registerTodoList();
  registerTodoApp();
});
