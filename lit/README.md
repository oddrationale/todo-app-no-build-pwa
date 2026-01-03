# Lit Todo App - No Build PWA

A todo app built with **Lit** and **LitElement** web components following a zero-build philosophy.

## 🚀 Quick Start

```bash
pnpm install
pnpm run dev
```

Open http://localhost:3000 in your browser.

## 🏗️ Architecture

### No Build Required
- **LitElement** web components - native custom elements
- **Import maps** load Lit from CDN (esm.sh)
- **Global types** via `.d.ts` files - no import statements needed
- **Type checking** via JSDoc + TypeScript in noEmit mode
- **PWA** with service worker for offline support

### Tech Stack
- **[Lit 3](https://lit.dev)** - Simple, fast web components
- **[LitElement](https://lit.dev/docs/components/overview/)** - Base class for reactive components
- **[@lit-labs/signals](https://www.npmjs.com/package/@lit-labs/signals)** - TC39 Signals integration for shared state
- **[daisyUI 5](https://daisyui.com)** - Tailwind CSS component library
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework

## 📁 Project Structure

```
lit/
├── index.html          # Entry point, import maps, CDN links
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (cache-first strategy)
├── package.json       # Dev dependencies only
├── jsconfig.json      # App code type checking
├── jsconfig.sw.json   # Service worker type checking
├── public/
│   └── icons/         # PWA icons
└── src/
    ├── main.js        # Entry point, imports all components
    ├── components/    # LitElement web components
    │   ├── todo-app.js       # Root app container
    │   ├── todo-list.js      # List container (reads signals)
    │   ├── todo-composer.js  # Add todo input
    │   └── todo-item.js      # Individual todo item
    ├── state/         # Global signals and actions
    │   └── todo.js    # Todo signals, actions (add, update, delete)
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

## 🔧 Scripts

- `pnpm run dev` - Start development server (localhost:3000)
- `pnpm run typecheck` - Type check JavaScript files
