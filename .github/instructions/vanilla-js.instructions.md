---
description: Vanilla JS + native Web Components patterns for no-build todo app
applyTo: "vanilla-js/**"
---

# Vanilla JS Todo App Instructions

## Native Web Components

No framework - use the Web Components APIs directly:
- `HTMLElement` / `customElements.define()`
- Template literals for HTML
- Native DOM APIs

## Component Syntax

```javascript
class TodoItem extends HTMLElement {
  static observedAttributes = ["label", "done"];

  constructor() {
    super();
    this._done = false;
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === "done") this._done = newValue !== null;
      this.render();
    }
  }

  get done() {
    return this._done;
  }

  set done(value) {
    this._done = value;
    if (value) {
      this.setAttribute("done", "");
    } else {
      this.removeAttribute("done");
    }
  }

  _bindEvents() {
    this.querySelector("input")?.addEventListener("change", () => {
      this.done = !this.done;
      this.dispatchEvent(new CustomEvent("toggle", { detail: this.done }));
    });

    this.querySelector("button")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("delete"));
    });
  }

  render() {
    const label = this.getAttribute("label") || "";
    this.innerHTML = `
      <li class="flex items-center gap-2">
        <input 
          type="checkbox" 
          class="checkbox"
          ${this._done ? "checked" : ""}
        />
        <span class="${this._done ? "line-through" : ""}">${this._escapeHtml(label)}</span>
        <button class="btn btn-error btn-sm">Delete</button>
      </li>
    `;
    this._bindEvents(); // Re-bind after render
  }

  _escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define("todo-item", TodoItem);
```

## Directory Structure

```
vanilla-js/
├── src/
│   ├── main.js              # Entry point, SW registration, init app
│   ├── components/
│   │   ├── todo-app.js      # Root app element
│   │   ├── todo-item.js     # Individual todo item
│   │   ├── todo-input.js    # Add todo input
│   │   └── todo-filter.js   # Filter buttons
│   ├── utils/
│   │   ├── storage.js       # LocalStorage helpers
│   │   └── html.js          # Safe HTML template helper
│   └── types/
│       └── todo.d.ts        # Todo type definitions
```

## Key Patterns

### Safe HTML Templates
Create a helper to prevent XSS:

```javascript
// utils/html.js
/**
 * Tagged template literal for safe HTML
 * @param {TemplateStringsArray} strings
 * @param {...any} values
 */
export function html(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ?? "";
    const escaped = typeof value === "string" ? escapeHtml(value) : value;
    return result + str + escaped;
  }, "");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
```

### Component Communication
Use custom events for all component communication:

```javascript
// Child dispatches
this.dispatchEvent(new CustomEvent("todo-added", {
  detail: { text: inputValue },
  bubbles: true,
}));

// Parent listens
this.addEventListener("todo-added", (e) => {
  this.addTodo(e.detail.text);
});
```

### State Management
Simple store pattern with EventTarget:

```javascript
// utils/store.js
class TodoStore extends EventTarget {
  /** @type {Array<{id: number, text: string, done: boolean}>} */
  #todos = [];

  constructor() {
    super();
    this.#todos = JSON.parse(localStorage.getItem("todos") || "[]");
  }

  get todos() {
    return [...this.#todos];
  }

  addTodo(text) {
    this.#todos.push({ id: Date.now(), text, done: false });
    this.#save();
  }

  toggleTodo(id) {
    const todo = this.#todos.find((t) => t.id === id);
    if (todo) todo.done = !todo.done;
    this.#save();
  }

  deleteTodo(id) {
    this.#todos = this.#todos.filter((t) => t.id !== id);
    this.#save();
  }

  #save() {
    localStorage.setItem("todos", JSON.stringify(this.#todos));
    this.dispatchEvent(new Event("change"));
  }
}

export const store = new TodoStore();
```

### Reactive Updates
Components subscribe to store changes:

```javascript
class TodoApp extends HTMLElement {
  connectedCallback() {
    store.addEventListener("change", () => this.render());
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="card card-bordered">
        <div class="card-body">
          <h2 class="card-title">Todo List</h2>
          <todo-input></todo-input>
          <ul class="space-y-2">
            ${store.todos.map(todo => `
              <todo-item 
                data-id="${todo.id}"
                label="${this._escapeAttr(todo.text)}"
                ${todo.done ? "done" : ""}
              ></todo-item>
            `).join("")}
          </ul>
          <todo-filter></todo-filter>
        </div>
      </div>
    `;
    this._bindEvents();
  }
}
```

## No Dependencies

This implementation uses zero runtime dependencies:
- No import map needed (unless adding optional utilities)
- All code is vanilla JavaScript
- Web Components API is built into browsers

## Vanilla JS-Specific Gotchas

1. **XSS Prevention**: Always escape user content - use `textContent` or escape helpers
2. **Event rebinding**: After `innerHTML` assignment, must rebind event listeners
3. **Attribute vs Property**: Use `getAttribute()`/`setAttribute()` for string data, properties for complex data
4. **Memory leaks**: Remove event listeners in `disconnectedCallback()` if added to external elements
5. **No reactivity**: Must manually call `render()` when state changes
6. **Boolean attributes**: Check with `hasAttribute()`, not `getAttribute()` which returns empty string

### Lifecycle Methods
```javascript
class MyElement extends HTMLElement {
  connectedCallback() { }      // Element added to DOM
  disconnectedCallback() { }   // Element removed from DOM  
  attributeChangedCallback(name, oldVal, newVal) { }  // Observed attribute changed
  adoptedCallback() { }        // Element moved to new document (rare)
}
```

### Type Checking
Use JSDoc for type safety:
```javascript
/**
 * @typedef {Object} Todo
 * @property {number} id
 * @property {string} text
 * @property {boolean} done
 */

/** @type {Todo[]} */
let todos = [];
```
