# Todo App Framework Comparison - No Build PWA

A comparative study of three frontend approaches for building a classic todo app as a Progressive Web App, all following a **zero-build philosophy**.

## 🎯 Project Goal

Compare developer experience and implementation patterns across:

- **[Preact](./preact/)** with HTM (JSX alternative)
- **[Lit](./lit/)** with LitElement web components
- **[Vanilla JS](./vanilla-js/)** with native Web Components

All implementations provide the same todo app functionality with identical styling, allowing direct comparison of framework-specific patterns.

## ⚡ No Build Philosophy

This project demonstrates modern web development **without bundlers, transpilers, or build steps**:

- ✅ **ESM-native** - All code uses native ES modules (`<script type="module">`)
- ✅ **CDN dependencies** - Runtime deps loaded via import maps from esm.sh
- ✅ **No transpilation** - JavaScript only, no TypeScript compilation
- ✅ **Type safety via JSDoc** - JSDoc comments + `.d.ts` files for IDE support

### Why No Build?

- **Instant startup** - No waiting for compilation or bundling
- **Simplified debugging** - Code in browser matches source exactly
- **True portability** - Copy files to any server and they just work
- **Learn the platform** - Understand how the web actually works

## 🎨 Styling

All implementations use:
- **[daisyUI 5](https://daisyui.com)** - Component library for Tailwind CSS
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework

Both loaded via CDN - no config files, no build step required.

## 📋 Todo App Features

Each implementation provides:
1. ➕ Add todos with text input
2. ✅ Toggle complete/incomplete status
3. 🗑️ Delete individual todos
4. 💾 Persist state in LocalStorage
5. 📱 PWA features (installable, works offline)

## 🚀 Quick Start

Each framework folder is self-contained. Choose one to explore:

### Preact
```bash
cd preact
pnpm install
pnpm run dev
```

### Lit
```bash
cd lit
pnpm install
pnpm run dev
```

### Vanilla JS
```bash
cd vanilla-js
pnpm install
pnpm run dev
```

Then open http://localhost:3000 in your browser.

## 🛠️ Development

### Type Checking
```bash
pnpm run typecheck  # Runs TypeScript in noEmit mode
```

JavaScript files are type-checked using JSDoc annotations without compilation.

### PWA Testing
1. Test in incognito/private window to avoid cache issues
2. Use Chrome DevTools > Application > Service Workers to debug
3. Check offline functionality by toggling offline mode

## 📚 Resources

- [ESM.sh](https://esm.sh) - CDN for ES modules
- [daisyUI Docs](https://daisyui.com)
- [Preact](https://preactjs.com) | [HTM](https://github.com/developit/htm)
- [Lit](https://lit.dev)
- [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## 📄 License

MIT
