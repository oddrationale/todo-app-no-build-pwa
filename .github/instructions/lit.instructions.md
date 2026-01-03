---
description: Lit + LitElement patterns for no-build todo app
applyTo: "lit/**"
---

# Lit Todo App Instructions

## Lit Setup

### CDN Dependencies (via import map)
```javascript
"lit": "https://esm.sh/lit@3"
"lit/decorators.js": "https://esm.sh/lit@3/decorators.js"
```

## Component Syntax

Use LitElement with `html` tagged template literals:

```javascript
import { LitElement, html, css } from "lit";

export class TodoItem extends LitElement {
  static properties = {
    label: { type: String },
    done: { type: Boolean },
  };

  // Disable Shadow DOM to use daisyUI classes
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.label = "";
    this.done = false;
  }

  _toggle() {
    this.done = !this.done;
    this.dispatchEvent(new CustomEvent("toggle", { detail: this.done }));
  }

  _delete() {
    this.dispatchEvent(new CustomEvent("delete"));
  }

  render() {
    return html`
      <li class="flex items-center gap-2">
        <input 
          type="checkbox" 
          class="checkbox"
          .checked=${this.done}
          @change=${this._toggle}
        />
        <span class=${this.done ? "line-through" : ""}>${this.label}</span>
        <button class="btn btn-error btn-sm" @click=${this._delete}>Delete</button>
      </li>
    `;
  }
}

customElements.define("todo-item", TodoItem);
```

### Lit Template Syntax
- Use `${expression}` for text interpolation
- Property binding: `.propertyName=${value}` (dot prefix)
- Attribute binding: `attributeName=${value}` (no prefix for string attributes)
- Boolean attribute: `?disabled=${isDisabled}` (question mark prefix)
- Event listener: `@eventname=${handler}` (at-sign prefix)
- Use `class` attribute with daisyUI classes

## Directory Structure

```
lit/
├── src/
│   ├── main.js              # Entry point, SW registration, define elements
│   ├── components/
│   │   ├── todo-app.js      # Root app element
│   │   ├── todo-item.js     # Individual todo item
│   │   ├── todo-input.js    # Add todo input
│   │   └── todo-filter.js   # Filter buttons
│   ├── utils/
│   │   └── storage.js       # LocalStorage helpers
│   └── types/
│       └── todo.d.ts        # Todo type definitions
```

## Web Component Patterns

### Element Registration
Register all custom elements in `main.js`:
```javascript
import { TodoApp } from "./components/todo-app.js";
import { TodoItem } from "./components/todo-item.js";
// ... other imports

// Elements auto-register via customElements.define() in each file
```

### Naming Convention
- Class names: PascalCase (`TodoItem`)
- Element tags: kebab-case with prefix (`todo-item`)
- Must contain a hyphen in tag name (web component requirement)

### Component Communication
Use custom events for child-to-parent communication:
```javascript
// Child dispatches
this.dispatchEvent(new CustomEvent("todo-added", { 
  detail: { text: this.inputValue },
  bubbles: true,
  composed: true  // Crosses shadow DOM boundary
}));

// Parent listens
html`<todo-input @todo-added=${this._handleAdd}></todo-input>`
```

### State Management
Lit components are stateful via reactive properties:
```javascript
static properties = {
  todos: { type: Array },
  filter: { type: String },
};
```

For shared state, use a simple store pattern or lift state to parent:
```javascript
// utils/store.js
class TodoStore extends EventTarget {
  #todos = [];
  
  get todos() { return this.#todos; }
  
  addTodo(text) {
    this.#todos = [...this.#todos, { id: Date.now(), text, done: false }];
    this.dispatchEvent(new Event("change"));
  }
}

export const store = new TodoStore();
```

## Styling with daisyUI

### Disable Shadow DOM (Required)
This project disables Shadow DOM in all Lit components to use daisyUI classes directly:

```javascript
export class MyElement extends LitElement {
  createRenderRoot() {
    return this;  // Render to light DOM, daisyUI classes work directly
  }
}
```

**Important**: Add `createRenderRoot()` to every LitElement component.

### Using daisyUI Classes
```javascript
render() {
  return html`
    <div class="card card-bordered">
      <div class="card-body">
        <h2 class="card-title">Todo List</h2>
        <ul class="space-y-2">${this.renderTodos()}</ul>
      </div>
    </div>
  `;
}
```

## Lit-Specific Gotchas

1. **Always disable Shadow DOM**: Every component needs `createRenderRoot() { return this; }` for daisyUI
2. **Property vs Attribute**: Use `.prop=${val}` for properties, `attr=${val}` for attributes
3. **Event bubbling**: Use `bubbles: true` for events (no need for `composed` since no Shadow DOM)
4. **Tag naming**: Custom element tags must contain a hyphen (`todo-item`, not `todoitem`)
5. **No decorators without build**: Use `static properties` instead of `@property()` decorator
