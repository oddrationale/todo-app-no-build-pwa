// Declare types globally so they can be used without imports
declare global {
  /**
   * Represents a single todo item
   */
  interface Todo {
    /** Unique identifier for the todo */
    id: string;
    /** The text label/description of the todo */
    label: string;
    /** Whether the todo has been completed */
    completed: boolean;
  }

  /**
   * Represents a list of todo items
   */
  type TodoList = Todo[];

  /**
   * Custom element type mapping for IDE autocomplete
   */
  interface HTMLElementTagNameMap {
    "todo-app": TodoAppElement;
    "todo-item": TodoItemElement;
    "todo-composer": TodoComposerElement;
    "todo-list": TodoListElement;
  }

  interface TodoAppElement extends HTMLElement {}
  interface TodoItemElement extends HTMLElement {
    todo: Todo | null;
    editing: boolean;
  }
  interface TodoComposerElement extends HTMLElement {}
  interface TodoListElement extends HTMLElement {}
}

// Export for explicit imports if needed
export type { Todo, TodoList };
