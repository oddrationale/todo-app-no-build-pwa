# Building Todo Apps Without a Build Step: Preact vs Lit vs Vanilla JS

## Introduction

Modern web development often feels like a maze of build tools, transpilers, and bundlers. But what if you could build a production-ready Progressive Web App (PWA) without any of that complexity? In this deep dive, we'll compare three approaches to building the same todo application—all following a **zero-build philosophy**.

We'll explore:
- **Preact + HTM**: Reactive components with JSX-like syntax
- **Lit + LitElement**: Web Components with declarative templates
- **Vanilla JS**: Native Web Components with manual DOM updates

Each implementation delivers the same functionality: add, edit, delete, and persist todos—all installable as a PWA and working offline. Let's see how they differ under the hood.

---

## Project Structure: Shared Foundations

All three implementations share a common architecture:

```
framework/
├── index.html          # Entry point with import maps
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (identical across all)
├── package.json       # Dev dependencies ONLY
├── src/
│   ├── main.js        # Application bootstrap
│   ├── components/    # UI components
│   ├── state/         # State management
│   └── utils/         # Storage utilities
```

### The Zero-Build Philosophy

Each approach follows these principles:

1. **ESM-native**: All code uses native ES modules (`<script type="module">`)
2. **CDN dependencies**: Runtime deps loaded via import maps from esm.sh
3. **No transpilation**: JavaScript only, no TypeScript compilation
4. **Type safety via JSDoc**: IDE support without build steps

The `package.json` files contain **only** dev dependencies:
```json
{
  "devDependencies": {
    "serve": "^14.2.4",
    "typescript": "^5.7.3"
  }
}
```

Runtime dependencies aren't in package.json—they're loaded from CDN via import maps.

---

## Approach 1: Preact + HTM

### Setup: Import Maps

[preact/index.html](preact/index.html):
```html
<script type="importmap">
{
  "imports": {
    "preact": "https://esm.sh/preact@10.28.1",
    "preact/": "https://esm.sh/preact@10.28.1/",
    "@preact/signals": "https://esm.sh/@preact/signals@1.3.0?external=preact",
    "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact"
  }
}
</script>
```

Notice the `?external=preact` query parameter—this prevents duplicate Preact instances.

### Component Architecture

Preact components are just functions that return HTM templates:

[preact/src/components/TodoComposer.js](preact/src/components/TodoComposer.js):
```javascript
import { html } from "htm/preact";
import { useSignal } from "@preact/signals";
import { addTodo } from "../state/todo.js";

export default function TodoComposer() {
  const label = useSignal("");

  const handleAddTodoClick = () => {
    if (!label.value.trim()) return;
    addTodo(label.value);
    label.value = "";
  };

  return html`
    <div class="card bg-base-100 shadow-xl mb-4">
      <div class="card-body p-4">
        <div class="flex gap-2 items-center">
          <input
            placeholder="Add a new todo"
            type="text"
            class="input input-bordered flex-1 bg-base-200"
            value=${label.value}
            onInput=${(e) => label.value = e.target.value}
          />
          <button
            class="btn btn-warning text-base-100 font-semibold"
            onClick=${handleAddTodoClick}
            disabled=${!label.value.trim()}
          >
            Add Todo
          </button>
        </div>
      </div>
    </div>
  `;
}
```

**Key features:**
- HTM provides JSX-like syntax without transpilation
- `useSignal` creates reactive state
- Event handlers are just inline functions
- Template syntax feels natural for React developers

### State Management: Preact Signals

[preact/src/state/todo.js](preact/src/state/todo.js):
```javascript
import { signal, effect } from "@preact/signals";
import { loadTodos, saveTodos } from "../utils/storage.js";

export const todos = signal(loadTodos());

// Automatic persistence - runs whenever todos change
effect(() => {
  saveTodos(todos.value);
});

export function addTodo(label) {
  todos.value = [...todos.value, createTodo(label)];
}
```

**What's happening:**
- `signal()` creates reactive state
- `effect()` auto-runs when dependencies change
- Mutations trigger re-renders automatically
- No manual subscriptions needed

### Consuming State in Components

[preact/src/components/Todo.js](preact/src/components/Todo.js):
```javascript
export default function TodoItem({ todo, onUpdate, onDelete }) {
  const editing = useSignal(false);

  return html`
    <div class="card bg-base-100 shadow-xl mb-4">
      ${editing.value
        ? html`<input value=${todo.label} onInput=${handleEditTodo} />`
        : html`<span>${todo.label}</span>`
      }
    </div>
  `;
}
```

**Pros:**
- ✅ Familiar React-like patterns
- ✅ Automatic reactivity with signals
- ✅ Minimal boilerplate
- ✅ Great TypeScript/JSDoc integration
- ✅ Small bundle size (~4KB for Preact)

**Cons:**
- ❌ Not true Web Components (no custom elements)
- ❌ Requires understanding of HTM syntax quirks
- ❌ Props drilling can become verbose
- ❌ Extra dependency (HTM) for JSX-like syntax

---

## Approach 2: Lit + LitElement

### Setup: Import Maps

[lit/index.html](lit/index.html):
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

### Component Architecture: True Web Components

[lit/src/components/todo-composer.js](lit/src/components/todo-composer.js):
```javascript
import { LitElement, html } from "lit";
import { addTodo } from "../state/todo.js";

export class TodoComposer extends LitElement {
  static properties = {
    label: { type: String },
  };

  // Disable Shadow DOM to use global styles (daisyUI, Tailwind)
  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.label = "";
  }

  _handleAddTodoClick() {
    if (!this.label.trim()) return;
    addTodo(this.label);
    this.label = "";
  }

  render() {
    return html`
      <div class="card bg-base-100 shadow-xl mb-4">
        <input
          .value=${this.label}
          @input=${(e) => this.label = e.target.value}
        />
        <button
          @click=${this._handleAddTodoClick}
          ?disabled=${!this.label.trim()}
        >
          Add Todo
        </button>
      </div>
    `;
  }
}

customElements.define("todo-composer", TodoComposer);
```

**Key features:**
- `LitElement` provides reactive properties
- `.value=${x}` sets properties (not attributes)
- `@click` syntax for event listeners
- `?disabled` for boolean attributes
- Shadow DOM disabled to use global Tailwind/daisyUI styles

### State Management: Lit Signals

[lit/src/state/todo.js](lit/src/state/todo.js):
```javascript
import { signal } from "@lit-labs/signals";
import { loadTodos, saveTodos } from "../utils/storage.js";

export const todos = signal(loadTodos());

export function addTodo(label) {
  todos.set([...todos.get(), createTodo(label)]);
  persistTodos(); // Manual persistence
}

function persistTodos() {
  saveTodos(todos.get());
}
```

**Differences from Preact:**
- Uses `get()` and `set()` instead of `.value`
- No automatic `effect()` - must call `persistTodos()` manually
- Signals work with Lit's reactive properties

### Using Signals in Components

[lit/src/components/todo-list.js](lit/src/components/todo-list.js):
```javascript
import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { todos } from "../state/todo.js";

export class TodoList extends SignalWatcher(LitElement) {
  render() {
    return html`
      ${todos.get().map(todo => html`
        <todo-item .todo=${todo}></todo-item>
      `)}
    `;
  }
}
```

**Key insight:** `SignalWatcher` mixin makes components reactive to signal changes.

### Event Communication

Lit uses Custom Events for child-to-parent communication:

```javascript
// Child dispatches
this.dispatchEvent(new CustomEvent("todo-delete", {
  detail: { id: this.todo.id },
  bubbles: true,
}));

// Parent listens
html`<todo-item @todo-delete=${this._handleDelete}></todo-item>`
```

**Pros:**
- ✅ True Web Components (standards-based)
- ✅ Declarative templates with tagged literals
- ✅ Great tooling and TypeScript support
- ✅ Rich ecosystem of Lit components
- ✅ Can be used with any framework

**Cons:**
- ❌ More boilerplate than Preact
- ❌ Shadow DOM disabled for global styles (defeats some benefits)
- ❌ Manual signal persistence required
- ❌ Learning curve for property/attribute binding syntax

---

## Approach 3: Vanilla JS + Native Web Components

### Setup: No Import Maps!

[vanilla-js/index.html](vanilla-js/index.html):
```html
<!-- No import maps - everything is vanilla! -->
<body data-theme="dark" class="bg-base-300">
  <todo-app></todo-app>
  <script type="module" src="./src/main.js"></script>
</body>
```

Zero external dependencies. Just native Web Components API.

### Component Architecture: Manual Everything

[vanilla-js/src/components/todo-composer.js](vanilla-js/src/components/todo-composer.js):
```javascript
class TodoComposer extends HTMLElement {
  #label = "";  // Private field

  connectedCallback() {
    if (this.querySelector(".card")) return; // Guard against re-entry
    this.render();
  }

  _handleAddTodoClick() {
    if (!this.#label.trim()) return;
    this.dispatchEvent(new CustomEvent("add-todo", {
      detail: { label: this.#label },
      bubbles: true,
    }));
    this.#label = "";
    this._updateInput();
  }

  _updateInput() {
    const input = this.querySelector("input");
    if (input) {
      input.value = this.#label;
      input.focus();
    }
    this._updateButtonState();
  }

  _updateButtonState() {
    const button = this.querySelector("button");
    if (button) {
      button.disabled = !this.#label.trim();
    }
  }

  _bindEvents() {
    const input = this.querySelector("input");
    const button = this.querySelector("button");
    
    input?.addEventListener("input", (e) => {
      this.#label = e.target.value;
      this._updateButtonState();
    });
    
    button?.addEventListener("click", () => this._handleAddTodoClick());
  }

  render() {
    this.innerHTML = `
      <div class="card bg-base-100 shadow-xl mb-4">
        <input placeholder="Add a new todo" type="text" value="" />
        <button disabled>Add Todo</button>
      </div>
    `;
    this._bindEvents();
  }
}

export const registerTodoComposer = () => 
  customElements.define("todo-composer", TodoComposer);
```

**Key characteristics:**
- Manual DOM updates everywhere
- `innerHTML` for initial render
- Query selectors to find elements
- Event listeners added manually
- Re-entry guards needed

### State Management: EventTarget-Based Store

[vanilla-js/src/state/todo.js](vanilla-js/src/state/todo.js):
```javascript
class TodoStore extends EventTarget {
  #todos = loadTodos();

  get todos() {
    return [...this.#todos];  // Always return a copy
  }

  #save() {
    saveTodos(this.#todos);
    this.dispatchEvent(new Event("change"));
  }

  addTodo(label) {
    this.#todos.push(this.#createTodo(label));
    this.#save();
  }

  updateTodo(updatedTodo) {
    this.#todos = this.#todos.map(todo =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    );
    this.#save();
  }
}

export const todoStore = new TodoStore();
```

**Pattern:**
- Extends `EventTarget` for pub/sub
- Private fields prevent external mutation
- Manual `change` event dispatch
- Components subscribe in `connectedCallback`

### Component Updates: Manual Subscriptions

[vanilla-js/src/components/todo-list.js](vanilla-js/src/components/todo-list.js):
```javascript
class TodoList extends HTMLElement {
  #boundHandleStoreChange;

  connectedCallback() {
    // Subscribe to store changes
    this.#boundHandleStoreChange = this._handleStoreChange.bind(this);
    todoStore.addEventListener("change", this.#boundHandleStoreChange);
    this.render();
  }

  disconnectedCallback() {
    // Clean up subscription
    todoStore.removeEventListener("change", this.#boundHandleStoreChange);
  }

  _handleStoreChange() {
    this.update();  // Re-render when store changes
  }

  update() {
    const container = this.querySelector(".space-y-4");
    if (container) {
      this._renderTodos(container);
    }
  }

  _renderTodos(container) {
    // Clear existing items
    Array.from(container.children).forEach(child => {
      if (child.tagName.toLowerCase() === "todo-item") {
        child.remove();
      }
    });

    // Add new items
    todoStore.todos.forEach(todo => {
      const item = document.createElement("todo-item");
      item.todo = todo;  // Setter triggers re-render
      container.appendChild(item);
    });
  }
}
```

**Manual work required:**
- Subscribe in `connectedCallback`
- Unsubscribe in `disconnectedCallback`
- Clear old DOM nodes
- Create new ones
- Set properties (triggers setters)

**Pros:**
- ✅ Zero external dependencies
- ✅ Full control over everything
- ✅ Smallest possible footprint
- ✅ True Web Components (no framework lock-in)
- ✅ Educational - see how frameworks work internally

**Cons:**
- ❌ Massive boilerplate
- ❌ Manual DOM updates prone to bugs
- ❌ No automatic reactivity
- ❌ Memory leak risks (forgetting to unsubscribe)
- ❌ Verbose event binding

---

## Side-by-Side: Adding a Todo

### Preact
```javascript
// State
const todos = signal(loadTodos());

// Component
export default function TodoComposer() {
  const label = useSignal("");
  
  return html`
    <input value=${label.value} onInput=${e => label.value = e.target.value} />
    <button onClick=${() => addTodo(label.value)}>Add</button>
  `;
}
```
**Lines of code:** ~15

### Lit
```javascript
// State
const todos = signal(loadTodos());

// Component
export class TodoComposer extends LitElement {
  static properties = { label: { type: String } };
  
  render() {
    return html`
      <input .value=${this.label} @input=${e => this.label = e.target.value} />
      <button @click=${() => addTodo(this.label)}>Add</button>
    `;
  }
}
```
**Lines of code:** ~20

### Vanilla JS
```javascript
// State
class TodoStore extends EventTarget {
  #todos = [];
  addTodo(label) {
    this.#todos.push({...});
    this.dispatchEvent(new Event("change"));
  }
}

// Component
class TodoComposer extends HTMLElement {
  #label = "";
  
  render() {
    this.innerHTML = `<input /><button>Add</button>`;
    this.querySelector("input").addEventListener("input", e => {
      this.#label = e.target.value;
      this.querySelector("button").disabled = !this.#label.trim();
    });
  }
}
```
**Lines of code:** ~40+

---

## Performance Considerations

### Bundle Size (gzipped)
- **Preact:** ~4KB (Preact) + ~1KB (HTM) + ~1KB (Signals) = **~6KB**
- **Lit:** ~8KB (Lit) + ~1KB (Signals) = **~9KB**
- **Vanilla JS:** **0KB** (pure browser APIs)

### Initial Load
All three load from CDN with HTTP/2 multiplexing. Vanilla JS has no runtime dependency fetch.

### Runtime Performance
- **Preact:** Virtual DOM diffing is fast but adds overhead
- **Lit:** Efficient tagged template caching, minimal re-renders
- **Vanilla JS:** Direct DOM manipulation, fastest possible (when done right)

**Real-world impact:** For a todo app, all three are imperceptibly fast. Differences matter at scale.

---

## Type Safety Comparison

All three use JSDoc for type checking without compilation.

### Preact
```javascript
/**
 * @param {Object} props
 * @param {Todo} props.todo
 * @param {(todo: Todo) => void} props.onUpdate
 */
export default function TodoItem({ todo, onUpdate }) {
  // TypeScript understands this
}
```

### Lit
```javascript
export class TodoItem extends LitElement {
  static properties = {
    /** @type {Todo | null} */
    todo: { type: Object }
  };
}
```

### Vanilla JS
```javascript
class TodoItem extends HTMLElement {
  /** @type {Todo | null} */
  #todo = null;

  /**
   * @param {Todo | null} value
   */
  set todo(value) {
    this.#todo = value;
  }
}
```

All work with `tsc --noEmit` for type checking. Vanilla JS requires the most manual annotations.

---

## Developer Experience

### Preact
**Best for:** Developers coming from React
- Familiar patterns
- Fast iteration
- Great tooling support
- Minimal mental overhead

### Lit
**Best for:** Web Components enthusiasts
- Standards-based
- Great IDE support
- Reusable across frameworks
- Professional/enterprise projects

### Vanilla JS
**Best for:** Learning or extreme minimalism
- Full understanding of Web Components
- No magic, no surprises
- Maximum portability
- Teaching tool

---

## Testing Complexity

### Preact
```javascript
import { render } from "@preact/test-utils";
import TodoComposer from "./TodoComposer.js";

test("adds todo", () => {
  const { container } = render(<TodoComposer />);
  // Standard testing patterns
});
```

### Lit
```javascript
import { fixture, html } from "@open-wc/testing";

test("adds todo", async () => {
  const el = await fixture(html`<todo-composer></todo-composer>`);
  // Standard Web Component testing
});
```

### Vanilla JS
```javascript
test("adds todo", () => {
  const el = document.createElement("todo-composer");
  document.body.appendChild(el);
  // Manual DOM testing
});
```

**Winner:** Preact and Lit have established testing ecosystems. Vanilla requires more manual work.

---

## When to Choose Each Approach

### Choose **Preact** when:
- ✅ You're migrating from React
- ✅ Team is familiar with hooks/components
- ✅ You want minimal bundle size
- ✅ Rapid prototyping is priority
- ✅ You don't need Web Components interop

**Example projects:** Landing pages, dashboards, internal tools

### Choose **Lit** when:
- ✅ You need true Web Components
- ✅ Building a design system
- ✅ Components will be used across multiple frameworks
- ✅ Standards compliance matters
- ✅ You want framework-agnostic components

**Example projects:** Component libraries, enterprise apps, CMS plugins

### Choose **Vanilla JS** when:
- ✅ Zero dependencies is a hard requirement
- ✅ Learning Web Components API
- ✅ Building a teaching example
- ✅ Extreme performance/size constraints
- ✅ You enjoy pain (kidding... mostly)

**Example projects:** Browser extensions, educational content, embedded widgets

---

## The Verdict

There's no universal winner—each approach shines in different contexts.

**For most projects:** **Preact** offers the best balance of DX, performance, and simplicity.

**For reusable components:** **Lit** provides standards-based portability and excellent tooling.

**For maximum control:** **Vanilla JS** teaches fundamentals and requires zero external code.

### My Recommendation

If you're building a new app from scratch:
1. **Start with Preact** - get productive fast
2. **Graduate to Lit** - if you need Web Components
3. **Use Vanilla JS** - for learning or extreme constraints

All three prove that modern web development doesn't require complex build pipelines. With import maps and ESM, we can build production-ready PWAs using just a text editor and a browser.

---

## Code Complexity Metrics

| Metric | Preact | Lit | Vanilla JS |
|--------|--------|-----|------------|
| **Todo Component** | 75 lines | 95 lines | 220 lines |
| **State Setup** | 15 lines | 20 lines | 70 lines |
| **Event Handling** | Inline | Inline | Manual binding |
| **Reactivity** | Automatic | Automatic | Manual subscriptions |
| **Type Annotations** | Minimal | Moderate | Extensive |

---

## Further Reading

- [Preact Documentation](https://preactjs.com/)
- [HTM (Hyperscript Tagged Markup)](https://github.com/developit/htm)
- [Lit Documentation](https://lit.dev/)
- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Import Maps Specification](https://github.com/WICG/import-maps)

---

## Conclusion

The no-build approach is not just viable—it's liberating. By eliminating transpilation, bundling, and complex toolchains, we reduce cognitive load and deployment complexity.

**Preact** brings React-like ergonomics with impressive efficiency. **Lit** offers standards-based components with excellent DX. **Vanilla JS** teaches the fundamentals while delivering zero-dependency solutions.

Choose based on your team's skills, project requirements, and long-term maintenance goals. All three demonstrate that sometimes, the best build tool is no build tool at all.

Happy coding! 🚀
