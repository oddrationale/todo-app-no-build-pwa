---
description: Lit + LitElement patterns for no-build applications
applyTo: "lit/**"
---

# Lit + LitElement No-Build Instructions

## Philosophy

**Zero-build architecture**: ESM-native, CDN dependencies via import maps, no transpilation, JSDoc for types.

## CDN Dependencies (via import map)

Add to your HTML file's `<head>`:
```html
<script type="importmap">
{
  "imports": {
    "lit": "https://esm.sh/lit@3.3.2",
    "lit/": "https://esm.sh/lit@3.3.2/",
    "@lit-labs/signals": "https://esm.sh/@lit-labs/signals@0.2.0"
  }
}
</script>
```

**Note**: Use `?deps=signal-polyfill@version` to ensure single polyfill instance across all imports.

## LitElement Component Syntax

### Basic Component Example

```javascript
import { LitElement, html } from "lit";

export class MyButton extends LitElement {
  static properties = {
    label: { type: String },
    active: { type: Boolean },
  };

  // Disable Shadow DOM to use global styles (daisyUI, Tailwind, etc.)
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.label = "Click me";
    this.active = false;
  }

  _handleClick() {
    this.active = !this.active;
    this.dispatchEvent(new CustomEvent("button-clicked", {
      detail: { active: this.active },
      bubbles: true
    }));
  }

  render() {
    return html`
      <button 
        class="btn ${this.active ? "btn-active" : ""}"
        @click=${this._handleClick}
      >
        ${this.label}
      </button>
    `;
  }
}

customElements.define("my-button", MyButton);
```

### render() Best Practices

- **Avoid side effects** - Don't modify component state or DOM directly
- **Use properties as input** - Base template on reactive properties only
- **Deterministic** - Same properties = same output
- **Let Lit handle DOM** - Don't manipulate DOM outside `render()`

**Renderable values**: Primitives (string, number, boolean), `TemplateResult` (from `html`), DOM Nodes, Arrays/iterables

### Lit Template Syntax
- `${expression}` - Text interpolation
- `.prop=${val}` - Property binding
- `attr=${val}` - Attribute binding
- `?attr=${bool}` - Boolean attribute
- `@event=${fn}` - Event listener

### Reactive Properties

```javascript
static properties = {
  count: { type: Number },
  items: { type: Array }
};

constructor() {
  super();
  this.count = 0;      // ✓ Initialize in constructor
  this.items = [];     // ✓ Initialize in constructor
}
```

**CRITICAL**: In JavaScript (no-build), **never use class fields** for reactive properties:
```javascript
count = 0;  // ✗ Class field breaks reactivity
```

Property changes trigger async batched re-renders (microtask timing). Multiple property changes = one update.

**Immutable data pattern** (objects/arrays):
```javascript
// ✓ Create new reference to trigger update
this.items = [...this.items, newItem];
this.items = this.items.filter(item => item.id !== id);

// ✗ Mutation doesn't trigger update
this.items.push(newItem);  // Same reference!
```

**Boolean properties**: Must default to `false` (attribute presence = true).

### Event Handler Type Annotations

For strict type checking, use inline JSDoc annotations:

```javascript
@click=${(/** @type {MouseEvent} */ e) => {
  console.log(e.clientX);
}}

@input=${(/** @type {Event & { target: HTMLInputElement }} */ e) => {
  console.log(e.target.value);
}}

@keypress=${(/** @type {KeyboardEvent} */ e) => {
  if (e.key === "Enter") this._handleSubmit();
}}
```

## Directory Structure

```
src/
├── main.js        # Entry point, import all components (triggers customElements.define)
├── components/    # LitElement classes (each calls customElements.define)
├── state/         # Global signals, actions
├── utils/         # Helper functions
└── types/         # Global type definitions (.d.ts)
```

**Registration**: Each component file calls `customElements.define()` at bottom. `main.js` imports all components to trigger registration.

## Type Checking

**Global types pattern (no imports needed):**
```typescript
// src/types/index.d.ts
declare global {
  /**
   * Example type - customize for your domain
   */
  interface User {
    id: string;
    name: string;
    email: string;
  }

  /**
   * Another example type
   */
  interface AppState {
    users: User[];
    loading: boolean;
  }
}

  // TypeScript tag name map for element type inference
  // Example: document.createElement('my-button') returns MyButton type
  interface HTMLElementTagNameMap {
    'my-button': MyButton;
    'my-card': MyCard;
  }
}

// Export for explicit imports if needed
export type { User, AppState };

/**
 * Import your components to reference in HTMLElementTagNameMap
 * @example
 * import type { MyButton } from '../components/my-button.js';
 */
```

**2. Configure `jsconfig.json` to include `.d.ts` files:**
```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "target": "esnext",
    "checkJs": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "*": ["src/types/*"]
    }
  },
  "include": ["src/**/*.js", "src/**/*.d.ts"],
  "exclude": ["node_modules"]
}
```

**3. Use types directly in JSDoc without imports:**
```javascript
/**
 * @param {User} user - The user object
 * Web Component Patterns
 */
export function getUserDisplayName(user) {
  return `${user.name} (${user.email})`;
}
```

**Service Worker** - Use separate jsconfig:

**jsconfig.sw.json:**
```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "esnext",
    "lib": ["esnext", "webworker"],
    "checkJs": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["sw.js"]
}
```
## Web Component Patterns

**Naming**: PascalCase classes, kebab-case tags (must have hyphen)

**Attributes vs Properties**:
- Attributes (HTML) → Properties (JS) via type conversion
- Properties are any type, attributes are always strings
- Default: property name lowercased = attribute name

### Events

**Declarative listeners** (`@` syntax - auto-bound to component):
```javascript
render() {
  return html`
    <button @click=${this._handleClick}>Click</button>
    <input @input=${this._handleInput} />
  `;
}

_handleClick(e) {
  console.log(this);  // Component instance
}
```

**Event listener options** (passive, capture, once):
```javascript
// Object with handleEvent + options
html`<div @touchstart=${{handleEvent: () => this.onTouch(), passive: true}}>Touch</div>`
```

**Imperative listeners** (use arrow functions for `this` binding):
```javascript
constructor() {
  super();
  // Listen on component itself
  this.addEventListener('click', (e) => console.log(e.target));
}
```

**External listeners** (Window, Document - cleanup in disconnectedCallback):
```javascript
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this._handleResize);
}

disconnectedCallback() {
  window.removeEventListener('resize', this._handleResize);
  super.disconnectedCallback();
}

_handleResize = () => {
  console.log(this.isConnected);  // Arrow function preserves `this`
};
```

**Dispatching events**:
```javascript
// Always set bubbles + composed for cross-component communication
this.dispatchEvent(new CustomEvent('item-selected', {
  detail: { id, value },
  bubbles: true,    // Bubbles up DOM tree
  composed: true    // Crosses shadow DOM boundaries
}));
```

**Event delegation** (reduce listeners, centralize handling):
```javascript
render() {
  return html`
    <div @click=${this._handleClick}>
      <button data-action="save">Save</button>
      <button data-action="cancel">Cancel</button>
    </div>
  `;
}

_handleClick(e) {
  const action = e.target.dataset.action;
  if (action === 'save') this._save();
  if (action === 'cancel') this._cancel();
}
```

**Event retargeting** (shadow DOM): `e.target` is host element from outside. Use `e.composedPath()[0]` for actual origin.

## State Management with Signals

**@lit-labs/signals** - TC39 Signals Proposal integration for shared state.

```sh
npm i @lit-labs/signals
```

### Signal Basics

```javascript
import { signal } from "@lit-labs/signals";

// Create a signal
const count = signal(0);

// Read value
console.log(count.get());  // 0

// Write value
count.set(count.get() + 1);
count.set(5);
```

### Global Signals (Shared State)

Define signals in a separate module for global state:

```javascript
// state/store.js
import { signal } from "@lit-labs/signals";

// Global signals
export const items = signal([]);
export const filter = signal("all");
export const isLoading = signal(false);

// Derived/computed values
export function getFilteredItems() {
  const filterValue = filter.get();
  const itemsValue = items.get();
  
  switch (filterValue) {
    case "active":
      return itemsValue.filter(item => !item.done);
    case "completed":
      return itemsValue.filter(item => item.done);
    default:
      return itemsValue;
  }
}

// Actions - pure functions that modify signals
export function addItem(text) {
  items.set([...items.get(), {
    id: crypto.randomUUID(),
    text,
    done: false
  }]);
}

export function updateItem(id, updates) {
  items.set(items.get().map(item =>
    item.id === id ? { ...item, ...updates } : item
  ));
}

export function deleteItem(id) {
  items.set(items.get().filter(item => item.id !== id));
}

// Persistence side effect
// Note: Use signal-utils or similar for effects/watchers
```

### Using Signals in Components with `html` Tag

**Recommended approach**: Import `html` from `@lit-labs/signals` instead of `lit`. This automatically watches signals in templates.

```javascript
import { LitElement } from "lit";
import { SignalWatcher, html } from "@lit-labs/signals";
import { items, deleteItem } from "../state/store.js";

export class ItemList extends SignalWatcher(LitElement) {
  createRenderRoot() {
    return this;
  }

  render() {
    // Signals are automatically watched when using html from @lit-labs/signals
    return html`
      <ul>
        ${items.map(item => html`
          <li key=${item.id}>
            ${item.text}
            <button @click=${() => deleteItem(item.id)}>Delete</button>
          </li>
        `)}
      </ul>
    `;
  }
}

customElements.define("item-list", ItemList);
```

**Key**: `SignalWatcher` mixin required. Import `html` from `@lit-labs/signals` for auto-watching.

### Alternative: Manual `watch()` Directive

If you need pinpoint updates or want to mix signal-watched and regular templates:

```javascript
import { LitElement, html } from "lit";
import { SignalWatcher, watch } from "@lit-labs/signals";
import { count } from "../state/store.js";

export class Counter extends SignalWatcher(LitElement) {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <p>Count: ${watch(count)}</p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}

customElements.define("my-counter", Counter);
```

### Local State: Use Reactive Properties

**For local component state, use Lit's built-in reactive properties** - not signals:

```javascript
import { LitElement, html } from "lit";

export class Counter extends LitElement {
  static properties = {
    count: { type: Number }
  };

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.count = 0;
  }

  render() {
    return html`
      <div>
        <p>Count: ${this.count}</p>
        <button @click=${() => this.count++}>Increment</button>
      </div>
    `;
  }
}

customElements.define("my-counter", Counter);
```

**Why?** Simpler, more efficient. Signals = shared state, reactive properties = local state.

### When to Use

**Signals**: Shared/global state, cross-component data, stores
**Reactive Properties**: Local component state, props

**API**: `signal(val)`, `SignalWatcher`, `html` (auto-watch), `.get()/.set()`

### Signals vs Events

**Events**: Component API (reusable, encapsulated), user interactions, async changes
**Signals**: Shared state, avoiding prop drilling

**When to dispatch events**:
- User interactions (clicks, input changes)
- Async state changes (fetch complete, timer finished)
- NOT for property changes from owner (menu.selectedItem = 'foo' shouldn't fire event)

**Event best practices**:
- `bubbles: true` - for event delegation and parent listening
- `composed: true` - to cross shadow DOM boundaries
- Fire after `await this.updateComplete` if event represents rendered state

**Example - Both working together:**
```javascript
// Reusable component emits event (doesn't know about signals)
export class TodoItem extends LitElement {
  createRenderRoot() { return this; }
  
  _handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-requested', {
      detail: { id: this.todoId },
      bubbles: true
    }));
  }
  
  render() {
    return html`
      <li>
        <span>${this.label}</span>
        <button @click=${this._handleDelete}>Delete</button>
      </li>
    `;
  }
}

// Parent connects event to signal action (using signals html tag)
import { SignalWatcher, html } from "@lit-labs/signals";
import { todos, deleteTodo } from "../state/store.js";

export class TodoList extends SignalWatcher(LitElement) {
  createRenderRoot() { return this; }
  
  render() {
    return html`
      <ul>
        ${todos.map(todo => html`
          <todo-item
            .todoId=${todo.id}
            .label=${todo.label}
            @delete-requested=${(e) => deleteTodo(e.detail.id)}
          ></todo-item>
        `)}
      </ul>
    `;
  }
}
```

## Styling with Global CSS

**Shadow DOM** provides style encapsulation (Lit default). **Disable it** to use global CSS (daisyUI/Tailwind):

```javascript
createRenderRoot() { return this; }  // Renders to light DOM instead
```
## Best Practices & Gotchas

1. **No class fields in JavaScript**: Initialize reactive properties in constructor, not as class fields
2. **Immutable data**: Use spread/filter to create new object/array references
3. **Boolean properties**: Must default to false (attribute presence = true)
4. **Disable Shadow DOM** for global CSS: `createRenderRoot() { return this; }`
5. **Tag names need hyphens**: `my-button` ✓ `mybutton` ✗
6. **No decorators**: Use `static properties`, not `@property()` (requires build tools)
7. **Property binding**: `.prop=${val}` for properties, `attr=${val}` for attributes
8. **Events**: `bubbles: true`, meaningful `detail` data
9. **Signals**: `SignalWatcher` mixin, `html` from `@lit-labs/signals`, `.get()/.set()` API
10. **Type check**: `tsc --noEmit`, inline JSDoc for event handlers
11. **SignalWatcher only when needed**: Only use `SignalWatcher(LitElement)` if component **reads signals** (calls `.get()`) in `render()`. Components that only write to signals or receive data via properties should use plain `LitElement`
