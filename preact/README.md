# Preact Todo App - No Build PWA

A todo app built with **Preact** and **HTM** (JSX alternative) following a zero-build philosophy.

## 🚀 Quick Start

```bash
pnpm install
pnpm run dev
```

Open http://localhost:3000 in your browser.

## 🏗️ Architecture

### No Build Required
- **HTM** replaces JSX - tagged template literals instead of transpilation
- **Import maps** load Preact from CDN (esm.sh)
- **Type checking** via JSDoc + TypeScript in noEmit mode
- **PWA** with service worker for offline support

### Tech Stack
- **[Preact 10](https://preactjs.com)** - Fast 3kb React alternative
- **[HTM](https://github.com/developit/htm)** - JSX-like syntax without build step
- **[daisyUI 5](https://daisyui.com)** - Tailwind CSS component library
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework

## 📁 Project Structure

```
preact/
├── index.html          # Entry point, import maps, CDN links
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (cache-first strategy)
├── package.json       # Dev dependencies only
├── jsconfig.json      # App code type checking
├── jsconfig.sw.json   # Service worker type checking
├── public/
│   ├── assets/        # Images, fonts
│   └── icons/         # PWA icons
└── src/
    ├── main.js        # App initialization, SW registration
    ├── app.js         # Root App component
    ├── components/    # Reusable UI components
    ├── hooks/         # Custom Preact hooks
    ├── utils/         # Helper functions (storage, etc.)
    └── types/         # JSDoc type definitions
```

### Key Syntax Rules
- Use `html\`` tagged templates, **not** `<JSX />`
- Event handlers: `onClick=${handler}` (with `${}`)
- Class attribute: `class="${className}"` (not `className`)
- Boolean attrs: `checked=${isChecked}`

## 🧪 Development

### Type Checking
```bash
pnpm run typecheck
```

Checks JavaScript files using JSDoc annotations without compilation.

### PWA Development
1. Update `ASSETS_TO_CACHE` in `sw.js` when adding new files
2. Increment `CACHE_NAME` version to force cache refresh
3. Clear cache in DevTools when testing changes

## 📋 Todo App Features

- ✅ Add new todos
- ✅ Toggle complete/incomplete
- ✅ Delete todos
- ✅ Filter: All / Active / Completed
- ✅ LocalStorage persistence
- ✅ Offline support (PWA)

## 🔧 Scripts

- `pnpm run dev` - Start development server (localhost:3000)
- `pnpm run typecheck` - Type check JavaScript files
