# Fluentify v2 — Project Conventions

## Tech Stack
- **Language:** TypeScript 5.x (strict mode)
- **UI:** React 18 + Tailwind CSS 4 + Framer Motion
- **Build:** Vite 5 + CRXJS (Chrome Extension Manifest V3)
- **State:** Zustand (popup/options), Chrome Storage API (persistence)
- **DB:** IndexedDB via `idb` library (vocabulary, translations cache)
- **Icons:** Lucide React
- **Testing:** Vitest

## Architecture
- `src/background/` — Service worker (message routing, SRS, translation)
- `src/content/` — Content script (DOM scanning, word replacement, overlays)
- `src/popup/` — Extension popup (React, 360×480)
- `src/options/` — Full settings page (React)
- `src/lib/` — Shared libraries (SRS, translation, audio, storage, utils)
- `src/data/` — Bundled frequency lists (JSON) and language configs
- `src/types/` — Shared TypeScript types
- `src/hooks/` — React hooks for storage, vocabulary, TTS, stats

## Conventions
- **Dark mode first** — base color `#0A0A0A`, use surface-0 through surface-4
- **Accent color:** Emerald `#10B981` (default), language-specific overrides
- **Import alias:** `@/` maps to `src/`
- **No `any`** — use proper types everywhere
- **Error handling:** Every async function must have try/catch or .catch()
- **Accessibility:** All interactive elements need ARIA labels, keyboard support
- **Performance:** Content script must not block page render; use `document_idle`
- **No console.log in production** — use conditional logging

## File Naming
- React components: PascalCase (`HoverCard.tsx`)
- Utilities/libs: camelCase (`scanner.ts`)
- Types: camelCase (`settings.ts`)
- Data files: lowercase (`fr.json`)

## Commands
```bash
npm run dev      # Vite dev server with HMR
npm run build    # TypeScript check + Vite production build
npm run test     # Vitest
npm run typecheck # TypeScript only (no build)
```

## Chrome Extension Loading
1. `npm run build`
2. Open `chrome://extensions`
3. Enable Developer Mode
4. "Load unpacked" → select `dist/` folder
