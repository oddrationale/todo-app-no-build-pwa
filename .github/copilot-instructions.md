# Todo App Framework Comparison - No Build PWA

## Project Goal

Compare three frontend approaches for building a classic todo app PWA:
- **Preact** with HTM (JSX alternative)
- **Lit** with LitElement web components
- **Vanilla JS** with native Web Components

All implementations follow a **zero-build philosophy** - no bundlers, transpilers, or build steps required.

## Core Design Principles

### No Build Architecture
- **ESM-native**: All code uses native ES modules (`<script type="module">`)
- **CDN dependencies**: Runtime deps loaded via import maps from esm.sh
- **No transpilation**: JavaScript only, no TypeScript compilation
- **Type safety via JSDoc**: Use JSDoc comments + `.d.ts` files for IDE support and type checking

### Package.json Convention
Each framework folder has its own `package.json` with **devDependencies only**:
- `serve` - Local development server
- `typescript` - Type checking (noEmit mode)
- Runtime dependencies are NOT in package.json - they're loaded via CDN

### Styling: daisyUI 5 + Tailwind CSS 4
All implementations use the same styling approach via CDN:
```html
<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```
- **No tailwind.config.js** - Tailwind CSS v4 doesn't use config files
- Follow `.github/instructions/daisyui.instructions.md` for component patterns
- Use daisyUI component classes over custom Tailwind utilities

## Shared Patterns

### Import Maps for CDN Dependencies
Each `index.html` defines an import map for framework-specific CDN imports:
```html
<script type="importmap">
{
  "imports": {
    "framework": "https://esm.sh/framework@version"
  }
}
</script>
```

### Type Checking Without TypeScript Compilation
```bash
pnpm run typecheck  # Runs TSC in noEmit mode
```
- JavaScript files checked via JSDoc annotations
- Two jsconfig files: one for app code, one for service worker (different lib targets)
- `.d.ts` files can provide additional type definitions

### PWA Implementation
All implementations share the same PWA approach:
- **Service Worker**: Cache-first with background update (stale-while-revalidate)
- **Manifest**: Standard PWA manifest with icons
- **Offline support**: Critical assets cached on install

Service worker pattern:
1. Update `ASSETS_TO_CACHE` when adding new critical files
2. Increment `CACHE_NAME` version to force cache refresh
3. Test in incognito to avoid cache issues during development

### Development Server
```bash
pnpm run dev  # Serves on localhost:3000
```
- No hot reload - manual browser refresh required
- Clear SW cache in DevTools when assets don't update

## Todo App Requirements

Each implementation should provide the same functionality:
1. **Add todos** - Text input with add button
2. **Toggle complete** - Click to mark done/undone
3. **Delete todos** - Remove individual items
4. **Persist state** - LocalStorage for offline support
5. **PWA features** - Installable, works offline

## Common Gotchas

1. **Import Map Scope**: External imports only work from `<script type="module">`, not inline scripts
2. **Service Worker Scope**: `sw.js` must be in root to cache entire app
3. **Cache Invalidation**: Clear SW cache in DevTools when assets don't update
4. **Dev Dependencies Only**: `package.json` deps are for local tooling, not bundled
5. **esm.sh externals**: Use `?external=dep` to avoid duplicate dependencies
