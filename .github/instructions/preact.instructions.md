---
description: Preact + HTM patterns for no-build todo app
applyTo: "preact/**"
---

# Preact Todo App Instructions

## Preact + HTM Setup

### CDN Dependencies (via import map)
```javascript
"preact": "https://esm.sh/preact@10.28.1"
"preact/hooks": "https://esm.sh/preact@10.28.1/hooks"
"htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact"
```

**Important**: Use `?external=preact` on htm to avoid duplicate Preact instances.

## Component Syntax

**Critical**: Use `html` tagged templates from `htm/preact`, NOT JSX syntax.

```javascript
import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";

/**
 * @param {{ label: string, onClick: () => void }} props
 */
export function TodoItem({ label, onClick }) {
  const [done, setDone] = useState(false);

  return html`
    <li class="flex items-center gap-2">
      <input 
        type="checkbox" 
        class="checkbox"
        checked=${done}
        onChange=${() => setDone(!done)} 
      />
      <span class=${done ? "line-through" : ""}>${label}</span>
      <button class="btn btn-error btn-sm" onClick=${onClick}>Delete</button>
    </li>
  `;
}
```

### HTM Syntax Rules
- Use `${expression}` for dynamic values (no curly braces like JSX)
- Event handlers: `onClick=${handler}` not `onClick={handler}`
- Boolean attributes: `checked=${isChecked}` or `disabled=${isDisabled}`
- Class binding: `class=${condition ? "a" : "b"}` (use `class`, not `className`)
- Fragments: `html\`<${Fragment}>...<//>\`` or just return arrays

## Directory Structure

```
preact/
├── src/
│   ├── main.js          # Entry point, SW registration, root render
│   ├── app.js           # Root App component (todo list container)
│   ├── components/      # Reusable UI components
│   │   ├── TodoItem.js
│   │   ├── TodoInput.js
│   │   └── TodoFilter.js
│   ├── hooks/           # Custom Preact hooks
│   │   └── useTodos.js  # Todo state management hook
│   ├── utils/           # Helper functions
│   │   └── storage.js   # LocalStorage helpers
│   └── types/           # JSDoc type definitions
│       └── todo.d.ts    # Todo type definitions
```

## State Management

Use Preact's built-in hooks - no external state library:

```javascript
// hooks/useTodos.js
import { useState, useEffect } from "preact/hooks";
import { loadTodos, saveTodos } from "../utils/storage.js";

export function useTodos() {
  const [todos, setTodos] = useState(() => loadTodos());

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
```

## Type Checking Configuration

`jsconfig.json` must include Preact JSX settings:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "checkJs": true,
    "strict": true
  }
}
```

## Preact-Specific Gotchas

1. **No JSX Transform**: Must use `html` tagged templates, never `<Component />` syntax
2. **htm externals**: Always use `?external=preact` when importing htm to avoid duplicate instances
3. **Class vs className**: HTM uses `class` attribute (HTML standard), not `className`
4. **Event naming**: Use standard DOM event names: `onClick`, `onChange`, `onInput`
5. **Ref access**: Use `useRef` from `preact/hooks`, access via `ref.current`
