---
description: Preact + HTM patterns for no-build applications
applyTo: "**/*.{js,jsx,html}"
---

# Preact + HTM No-Build Instructions

## Philosophy

Build Preact applications using **zero-build architecture**:
- **ESM-native**: Use native ES modules (`<script type="module">`)
- **CDN dependencies**: Load runtime deps via import maps from esm.sh
- **No transpilation**: JavaScript only, no TypeScript compilation
- **HTM instead of JSX**: Use `htm` tagged templates (no build step needed)
- **Type safety via JSDoc**: Use JSDoc comments + `.d.ts` files for IDE support

## CDN Dependencies (via import map)

Add to your HTML file's `<head>`:
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

**Critical**: Always use `?external=preact` on htm and @preact/signals to avoid duplicate Preact instances.
## State Management with Signals

**Prefer @preact/signals over useState/useContext** for all state management.

### Why Signals?
- Automatic dependency tracking and fine-grained reactivity
- No manual dependency arrays or useEffect for derived state
- Better performance - only components that access signals re-render
- Simpler global state without Context boilerplate
- Work seamlessly with HTM tagged templates

### Signal Hooks (Local State)

Use in components for local state:

```javascript
import { html } from "htm/preact";
import { useSignal, useComputed, useSignalEffect } from "@preact/signals";

export function Counter() {
  // Local signal state (replaces useState)
  const count = useSignal(0);
  const name = useSignal("");
  
  // Computed value (replaces useMemo)
  const displayName = useComputed(() => 
    name.value.trim() || "Anonymous"
  );
  
  // Side effects (replaces useEffect)
  useSignalEffect(() => {
    console.log(`Count changed to ${count.value}`);
    // Return cleanup function if needed
  });
  
  return html`
    <div>
      <p>Count: ${count}</p>
      <button onClick=${() => count.value++}>Increment</button>
    </div>
  `;
}
```

### Global Signals (Shared State)

Define signals outside components - no Context needed:

```javascript
// state/store.js
import { signal, computed, effect } from "@preact/signals";

// Global signals - can be imported anywhere
export const items = signal([]);
export const filter = signal("all");

// Computed state - automatically updates when dependencies change
export const filteredItems = computed(() => {
  switch (filter.value) {
    case "active": return items.value.filter(item => !item.done);
    case "completed": return items.value.filter(item => item.done);
    default: return items.value;
  }
});

// Side effects - run automatically when dependencies change
effect(() => {
  localStorage.setItem("items", JSON.stringify(items.value));
});

// Actions - pure functions that modify signals
export function addItem(text) {
  items.value = [...items.value, {
    id: crypto.randomUUID(),
    text,
    done: false
  }];
}

export function updateItem(id, updates) {
  items.value = items.value.map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
}

export function deleteItem(id) {
  items.value = items.value.filter(item => item.id !== id);
}
```

### Using Global Signals in Components

```javascript
import { html } from "htm/preact";
import { filteredItems, addItem, deleteItem } from "../state/store.js";

export function ItemList() {
  // No useState needed - signals automatically trigger re-renders
  // Only this component re-renders when filteredItems changes
  
  return html`
    <ul>
      ${filteredItems.value.map(item => html`
        <li key=${item.id}>
          ${item.text}
          <button onClick=${() => deleteItem(item.id)}>Delete</button>
        </li>
      `)}
    </ul>
  `;
}
```

### Signal Best Practices

**When to use each:**
- `signal()` - Global state shared across components
- `useSignal()` - Local component state (replaces useState)
- `computed()` - Global derived values (replaces useMemo globally)
- `useComputed()` - Component-local derived values (replaces useMemo)
- `effect()` - Global side effects (persistence, logging, etc.)
- `useSignalEffect()` - Component side effects (replaces useEffect)

**Avoid:**
- `useState` / `useReducer` - Use signals instead
- `useContext` - Use global signals instead
- `useMemo` - Use computed instead
- `useEffect` - Use useSignalEffect instead
- Manual dependency arrays - Signals track dependencies automatically
## HTM Component Syntax

**Critical**: Use `html` tagged templates from `htm/preact`, NOT JSX syntax.

### Basic Component Example
```javascript
import { html } from "htm/preact";

/**
 * @param {Object} props
 * @param {string} props.name
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 */
export function Button({ name, active, onClick }) {
  return html`
    <button 
      class=${active ? "btn-active" : "btn"}
      onClick=${onClick}
    >
      ${name}
    </button>
  `;
}
```

### HTM Syntax Rules
- **Dynamic values**: `${expression}` (no curly braces like JSX)
- **Event handlers**: `onClick=${handler}` not `onClick={handler}`
- **Boolean attributes**: `checked=${isChecked}` or `disabled=${isDisabled}`
- **Class binding**: `class=${condition ? "active" : ""}` (use `class`, not `className`)
- **Fragments**: `html\`<${Fragment}>...<//>\`` or just return arrays
- **Components**: `<${ComponentName} prop=${value} />`

### Event Handler Type Annotations
To avoid implicit `any` errors in strict mode, use inline JSDoc type annotations:

```javascript
onClick=${(/** @type {MouseEvent} */ e) => {
  console.log(e.clientX);
}}

onInput=${(/** @type {Event & { target: HTMLInputElement }} */ e) => {
  console.log(e.target.value);
}}

onKeyPress=${(/** @type {KeyboardEvent} */ e) => {
  if (e.key === "Enter") handleSubmit();
}}
```

## Recommended Directory Structure

```
src/
├── main.js           # Entry point, root render, SW registration
├── app.js            # Root App component
├── components/       # Reusable UI components
│   ├── Button.js
│   ├── Card.js
│   └── Modal.js
├── state/            # Global signals and actions
│   └── store.js      # Signals, computed values, and actions
├── utils/            # Helper functions
│   └── storage.js    # LocalStorage/API helpers
└── types/            # JSDoc type definitions
    └── index.d.ts    # Global type declarations
```

**Note**: 
- With signals, there's no need for `hooks/` directory - use `state/` instead
- Custom hooks are rarely needed - signals handle most state management
- Keep components pure and simple - all state logic lives in `state/`

## Application Entry Point

### main.js Pattern
```javascript
import { render } from "preact";
import { html } from "htm/preact";
import { App } from "./app.js";

// Service worker registration (optional, for PWAs)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.log("SW registration failed:", err));
  });
}

// Render the root component
const root = document.getElementById("app");
if (root) {
  render(html`<${App} />`, root);
}
```

### HTML Setup
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Preact App</title>
    
    <!-- Import map for CDN dependencies -->
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
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

## Type Checking Configuration

### Global Types Pattern (Recommended)

For the best type experience, configure global types that work without imports:

**1. Create `.d.ts` file with global types:**
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

// Export for explicit imports if needed
export type { User, AppState };
```

**2. Configure `jsconfig.json` to include `.d.ts` files:**
```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "target": "esnext",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
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
 * @returns {string}
 */
export function getUserDisplayName(user) {
  return `${user.name} (${user.email})`;
}
```

### Benefits
- **No `@typedef` imports needed** - Just use types directly in JSDoc
- **Cleaner code** - No `import("../types/foo.d.ts").Bar` patterns
- **Better IDE support** - Full autocomplete without imports
- **Single source of truth** - All types in `.d.ts` files

### Alternative: Inline Type Imports
If you prefer explicit imports or can't use global types:
```javascript
/** @typedef {import("../types/index.d.ts").User} User */

/**
 * @param {User} user
 */
export function processUser(user) { ... }
```

### Service Worker Configuration
If you have a service worker, exclude it with a separate jsconfig:

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

## Common Gotchas & Best Practices

### Critical Rules
1. **No JSX Transform**: Must use `html` tagged templates, never `<Component />` syntax
2. **HTM externals**: Always use `?external=preact` on htm and @preact/signals imports to avoid duplicate instances
3. **Class vs className**: HTM uses `class` attribute (HTML standard), not `className`
4. **Event naming**: Use standard DOM event names: `onClick`, `onChange`, `onInput` (camelCase)
5. **Signal access**: Always use `.value` to read or write signal values: `mySignal.value`

### Signals Best Practices
6. **Prefer signals**: Use `useSignal` instead of `useState`, `useSignalEffect` instead of `useEffect`
7. **Computed signals**: Use `useComputed()` in components or `computed()` globally instead of `useMemo`
8. **Global signals**: Define signals outside components with `signal()` for global state - no Context needed
9. **No dependency arrays**: Signal effects track dependencies automatically - no manual arrays needed
10. **Effect cleanup**: `useSignalEffect()` and `effect()` can return cleanup functions

### Other Tips
11. **Ref access**: Use `useRef` from `preact/hooks`, access via `ref.current`
12. **Fragment syntax**: Use `html\`<${Fragment}>...<//>\`` or return arrays
13. **Keys for lists**: Always use `key=${item.id}` when mapping arrays
14. **Type annotations**: Add inline JSDoc types for event handlers to avoid `any` errors

### Development Setup
- **Dev server**: Use `serve` or similar static server - no build tools needed
- **Type checking**: Run `tsc --noEmit` for type checking without compilation
- **No hot reload**: Manual browser refresh required (keeps it simple)
- **Import maps**: Only work in `<script type="module">`, not inline scripts
