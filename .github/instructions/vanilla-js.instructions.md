---
description: Vanilla JS + native Web Components patterns for no-build applications
applyTo: "vanilla-js/**"
---

# Vanilla JS + Web Components No-Build Instructions

> Patterns inspired by [Plain Vanilla Web](https://plainvanillaweb.com/)

## Philosophy

- **ESM-native**: Use native ES modules (`<script type="module">`)
- **No runtime dependencies**: Pure JavaScript, browser-native APIs only
- **Native Web Components**: `HTMLElement` + `customElements.define()`
- **Type safety via JSDoc**: JSDoc comments + `.d.ts` files for IDE support

## Component Syntax

### Basic Example

```javascript
class TodoItem extends HTMLElement {
  static observedAttributes = ["label", "done"];
  #done = false;

  connectedCallback() {
    if (this.querySelector("li")) return; // Guard against re-entry
    this.render();
    this._bindEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "done") this.#done = newValue !== null;
    this.update();
  }

  get done() { return this.#done; }
  set done(value) {
    this.#done = value;
    this.toggleAttribute("done", value);
    // Call update() if DOM exists, otherwise wait for render()
    if (this.querySelector("li")) this.update();
  }

  _bindEvents() {
    this.querySelector("input")?.addEventListener("change", () => {
      this.done = !this.done;
      this.dispatchEvent(new CustomEvent("toggle", { bubbles: true }));
    });
    this.querySelector("button")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("delete", { bubbles: true }));
    });
  }

  render() {
    const label = this.getAttribute("label") || "";
    this.innerHTML = `
      <li class="flex items-center gap-2">
        <input type="checkbox" class="checkbox" ${this._done ? "checked" : ""} />
        <span class="${this._done ? "line-through" : ""}">${this._escapeHtml(label)}</span>
        <button class="btn btn-error btn-sm">Delete</button>
      </li>
    `;
    this._bindEvents();
  }

  update() {
    const checkbox = this.querySelector("input");
    const span = this.querySelector("span");
    if (!checkbox || !span) return; // Guard - may be called before render
    checkbox.checked = this._done;
    span.className = this._done ? "line-through" : "";
  }

  _escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

export const registerTodoItem = () => customElements.define("todo-item", TodoItem);
```

### Registration Pattern

```javascript
// main.js - centralized registration
import { registerTodoApp } from "./components/todo-app.js";
import { registerTodoItem } from "./components/todo-item.js";

document.addEventListener("DOMContentLoaded", () => {
  registerTodoApp();
  registerTodoItem();
});
```

### Lifecycle Methods

| Method | When Called | Use For |
|--------|-------------|---------|
| `constructor()` | Element created | Initialize private state only (`super()` first). **Omit if only calling `super()`** |
| `connectedCallback()` | Added to DOM (may repeat) | Create DOM, bind events, call `update()` |
| `disconnectedCallback()` | Removed from DOM | Clean up external listeners |
| `attributeChangedCallback()` | Observed attribute changes | Call `update()` |

**Critical**: Define `static observedAttributes = [...]` to trigger `attributeChangedCallback()`.

### The render/update Pattern

- **`render()`**: Creates full DOM structure (use sparingly - destroys event listeners)
- **`update()`**: Modifies existing DOM elements (preferred for state changes)

```javascript
connectedCallback() {
  if (this.querySelector(".content")) return; // Guard re-entry
  this.innerHTML = `<div class="content"><h3></h3><p></p></div>`;
  this.update();
}

update() {
  const h3 = this.querySelector("h3");
  if (!h3) return; // Guard - attributeChangedCallback may fire first
  h3.textContent = this.getAttribute("title");
}
```

### Attributes vs Properties

| Aspect | Attributes | Properties |
|--------|------------|------------|
| Data types | Strings only | Any JS value |
| Best for | Simple/boolean values | Objects, arrays |
| Visibility | In HTML inspector | JS only |
| Access | `getAttribute/setAttribute` | Getters/setters |

```javascript
// Attribute → Property sync
set title(value) { this.setAttribute("title", value); }
get title() { return this.getAttribute("title") || ""; }

// Property for complex data - use update() if DOM exists, render() otherwise
set items(value) { 
  this.#items = value; 
  if (this.querySelector(".list")) {
    this.update();
  } else {
    this.render();
  }
}
get items() { return this.#items || []; }
```

## State Management

### Principles

1. **Group related state** - Merge frequently co-updated variables
2. **Single source of truth** - Avoid redundant/duplicated state
3. **Lift state up** - Shared state belongs in nearest common ancestor
4. **Events up, state down** - Children dispatch events, parents push state via attributes/properties

### Lifting State Up

```javascript
class Accordion extends HTMLElement {
  #activeIndex = 0;

  set activeIndex(i) { this.#activeIndex = i; this.update(); }

  connectedCallback() {
    this.querySelectorAll("accordion-panel").forEach((panel, i) => {
      panel.addEventListener("show", () => this.activeIndex = i);
    });
    this.update();
  }

  update() {
    this.querySelectorAll("accordion-panel").forEach((panel, i) => {
      panel.toggleAttribute("active", i === this.#activeIndex);
    });
  }
}
```

### Global Store (EventTarget)

```javascript
class TodoStore extends EventTarget {
  #todos = JSON.parse(localStorage.getItem("todos") || "[]");

  get todos() { return [...this.#todos]; }

  addTodo(text) {
    this.#todos.push({ id: crypto.randomUUID(), text, done: false });
    this.#save();
  }

  #save() {
    localStorage.setItem("todos", JSON.stringify(this.#todos));
    this.dispatchEvent(new Event("change"));
  }
}

export const todoStore = new TodoStore();
```

Components subscribe in `connectedCallback()`, unsubscribe in `disconnectedCallback()`.

## Passing Data

| Direction | Method | Use Case |
|-----------|--------|----------|
| Child → Parent | `CustomEvent` with `bubbles: true` | User actions, form submissions |
| Parent → Child | Property setters | Complex data (objects, arrays) |
| Parent → Child | Method calls | Stateless/presentational components |

```javascript
// Child dispatches event (preferred pattern)
this.dispatchEvent(new CustomEvent("add", { detail: { text }, bubbles: true }));

// Parent listens and updates store
this.querySelector("todo-form").addEventListener("add", (e) => {
  todoStore.addTodo(e.detail.text); // Store update happens in parent
});

// Parent pushes via property
this.querySelector("todo-list").items = this.#items.slice();
```

**Note**: Prefer event dispatch over direct store imports in child components to maintain "events up, state down" pattern. Only the parent/list component should interact with stores directly.

## Security: XSS Prevention

**Always escape user content:**

```javascript
// Method 1: textContent (safest)
element.textContent = userInput;

// Method 2: Escape helper
_escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
```

Optional `html` tagged template for auto-escaping: see [html-literal](https://github.com/jsebrech/html-literal).

## Type Checking

### Global Types Pattern (Recommended)

Define types in `.d.ts` files with `declare global` - no imports needed in JS files:

```typescript
// src/types/index.d.ts
declare global {
  /** Todo item structure */
  interface Todo {
    id: string;
    text: string;
    done: boolean;
  }

  /** Application filter state */
  type FilterState = "all" | "active" | "completed";

  /** Custom element type mapping for IDE autocomplete */
  interface HTMLElementTagNameMap {
    "todo-app": TodoApp;
    "todo-item": TodoItem;
    "todo-composer": TodoComposer;
  }
}

export type { Todo, FilterState };
```

**Benefits:**
- Use types directly in JSDoc without imports: `@param {Todo} todo`
- IDE autocomplete for `document.querySelector("todo-item")`
- Single source of truth for all types

### JSDoc Annotations

```javascript
/** @typedef {{ id: string, text: string, done: boolean }} Todo */

/** @type {Todo[]} */
let todos = [];

/** @param {string} text @returns {Todo} */
function createTodo(text) {
  return { id: crypto.randomUUID(), text, done: false };
}
```

### Event Handler Types

```javascript
input.addEventListener("input", (/** @type {Event & {target: HTMLInputElement}} */ e) => {
  console.log(e.target.value);
});
```

### jsconfig.json

Include `.d.ts` files to enable global types:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "checkJs": true,
    "strict": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.js", "src/**/*.d.ts"],
  "exclude": ["node_modules", "sw.js"]
}
```

**Service worker** uses separate config with WebWorker lib:

```json
// jsconfig.sw.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "WebWorker"],
    "checkJs": true,
    "strict": true
  },
  "include": ["sw.js"]
}
```

## Directory Structure

```
vanilla-js/
├── index.html
├── manifest.json
├── sw.js
├── jsconfig.json
├── package.json         # Dev deps only (serve, typescript)
└── src/
    ├── main.js          # Entry point, register components
    ├── components/      # Web components
    ├── state/           # Stores (EventTarget-based)
    ├── utils/           # Helpers (storage, html escaping)
    └── types/           # .d.ts files
```

## Quick Reference

### Best Practices

- Export `registerXComponent()` functions for centralized registration
- Guard `connectedCallback()` against re-entry when element is moved
- Use `update()` for state changes, `render()` only for initial DOM
- Property setters should check if DOM exists: call `update()` if yes, `render()` if no
- Omit empty constructors that only call `super()`
- Use `#privateField` for encapsulated state, `_method` for private methods
- Prefer event dispatch over direct store imports in child components
- Always escape user input before inserting into HTML

### Common Gotchas

| Issue | Solution |
|-------|----------|
| XSS vulnerabilities | Use `textContent` or escape helpers |
| Lost event listeners | Re-bind after `innerHTML` or use `update()` pattern |
| Property setters calling `render()` | Check if DOM exists: `if (this.querySelector(...)) update(); else render();` |
| `attributeChangedCallback` before DOM ready | Guard with `if (!element) return` |
| `connectedCallback` runs multiple times | Guard with `if (this.querySelector(...)) return` |
| Boolean attributes | Use `hasAttribute()` / `toggleAttribute()` |
| Custom element naming | Must contain dash: `todo-item`, not `todoitem` |
| Self-closing tags | Invalid: use `<my-el></my-el>` not `<my-el />` |

### Development

```bash
pnpm install          # Install dev dependencies
pnpm run dev          # Start server (localhost:3000)
pnpm run typecheck    # Type check
```

No build step - refresh browser to see changes. Clear SW cache in DevTools when needed.
