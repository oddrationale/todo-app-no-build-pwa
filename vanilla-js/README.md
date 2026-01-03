# Vanilla JS Todo App - No Build PWA

A todo app built with **vanilla JavaScript** and **native Web Components** following a zero-build philosophy.

> Patterns inspired by [Plain Vanilla Web](https://plainvanillaweb.com/)

## 🚀 Quick Start

```bash
pnpm install
pnpm run dev
```

Open http://localhost:3000 in your browser.

## 🏗️ Architecture

### No Build Required
- **Native Web Components** - pure `HTMLElement` + `customElements.define()`
- **No runtime dependencies** - browser-native APIs only
- **Global types** via `.d.ts` files - no import statements needed
- **Type checking** via JSDoc + TypeScript in noEmit mode
- **PWA** with service worker for offline support

### Tech Stack
- **Native Web Components** - Standard custom elements API
- **EventTarget Store** - Global state management using browser native `EventTarget`
- **[daisyUI 5](https://daisyui.com)** - Tailwind CSS component library (CDN)
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework (CDN)

## 📁 Project Structure

```
vanilla-js/
├── index.html          # Entry point, CDN links for styling
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (cache-first strategy)
├── package.json       # Dev dependencies only (serve, typescript)
├── jsconfig.json      # App code type checking
├── jsconfig.sw.json   # Service worker type checking
├── public/
│   └── icons/         # PWA icons
└── src/
    ├── main.js        # Entry point, centralized component registration
    ├── components/    # Native Web Components
    │   ├── todo-app.js       # Root app container
    │   ├── todo-list.js      # List container (subscribes to store)
    │   ├── todo-composer.js  # Add todo input (dispatches events)
    │   └── todo-item.js      # Individual todo item
    ├── state/         # EventTarget-based stores
    │   └── todo.js    # TodoStore (EventTarget with change events)
    ├── utils/         # Helper functions
    │   └── storage.js # LocalStorage persistence
    └── types/         # Global type definitions
        └── todo.d.ts  # Todo, TodoList types (global via declare)
```

### PWA Development
1. Update `ASSETS_TO_CACHE` in `sw.js` when adding new files
2. Increment `CACHE_NAME` version to force cache refresh
3. Clear cache in DevTools when testing changes

## 📋 Todo App Features

- ✅ Add new todos
- ✅ Edit todo text inline
- ✅ Toggle complete/incomplete
- ✅ Delete todos
- ✅ LocalStorage persistence
- ✅ Offline support (PWA)
- ✅ UUID-based IDs (via `crypto.randomUUID()`)

## 🎯 Key Patterns

### Component Lifecycle
- **`connectedCallback()`** - Create DOM and bind events (guards re-entry)
- **`render()`** - Initial DOM creation (destroys event listeners)
- **`update()`** - Updates existing DOM elements (preserves listeners)
- **Property setters** - Check if DOM exists: call `update()` if yes, `render()` if no

### State Management
- **Events up** - Child components dispatch `CustomEvent` with `bubbles: true`
- **State down** - Parent pushes state via property setters
- **EventTarget Store** - Components subscribe/unsubscribe to global store
- **No direct store imports in children** - Only parent/list interacts with store

### Best Practices
- ✅ Export `registerXComponent()` functions for centralized registration
- ✅ Guard `connectedCallback()` against re-entry
- ✅ Use `#privateField` for state, `_method` for private methods
- ✅ Omit empty constructors that only call `super()`
- ✅ Always escape user input before inserting into HTML (`_escapeHtml()`)

## 🔧 Scripts

- `pnpm run dev` - Start development server (localhost:3000)
- `pnpm run typecheck` - Type check JavaScript files

## 📚 Learn More

See [`.github/instructions/vanilla-js.instructions.md`](../.github/instructions/vanilla-js.instructions.md) for detailed patterns and examples.
