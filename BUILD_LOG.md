# Fluentify v2 — Build Log

## Phase 1: Project Scaffolding ✅
**Date:** 2026-02-16

**What was built:**
- Vite 5 + CRXJS project initialized with TypeScript strict mode
- React 18 + Tailwind CSS 4 + Framer Motion configured
- Manifest V3 (`src/manifest.ts`) with permissions: storage, activeTab, tts, alarms
- Full file structure created per tech spec
- Popup shell (360×480, dark mode, stats card placeholder)
- Options page shell
- Content script entry + CSS styles for replaced words
- Background service worker stub
- Type definitions: Word, Settings, Messages
- Placeholder icons (emerald colored PNGs)
- CLAUDE.md with project conventions

**Build result:** ✅ `npm run build` succeeds (871ms, 15 output files)
**Bundle size:** ~163KB total (143KB is Tailwind CSS)

**Issues:**
- Had to add `@types/node` for vite.config.ts (path/process references)
- Removed tsconfig project references — single tsconfig simpler for this project
- CRXJS beta (2.0.0-beta.25) has some deprecation warnings but works fine

**Next:** Phase 2 — Content Script Immersion Engine

---

## Phase 2: Content Script — Immersion Engine ✅
**Date:** 2026-02-16

**What was built:**
- **DOM Scanner** (`content/immersion/scanner.ts`) — TreeWalker that finds eligible text nodes, skips scripts/styles/inputs/contenteditable/code/hidden elements
- **Word Selector** (`content/immersion/selector.ts`) — Reverse-lookup from English→French using frequency list; scores by learning priority + frequency rank; respects intensity setting (5-50%)
- **Word Replacer** (`content/immersion/replacer.ts`) — Splits text nodes, inserts styled `<span>` elements with data attributes for original/translation/pronunciation/POS/gender; supports full restoration
- **MutationObserver** (`content/immersion/observer.ts`) — Watches for DOM changes (SPA support), throttled to max 1/sec
- **Hover Card** (`content/overlay/HoverCard.tsx`) — Shadow DOM mounted React component showing translation, pronunciation, POS, gender, audio button, "Add to deck" and "Skip" actions
- **Overlay System** (`content/overlay/mount.ts`) — Shadow DOM isolation with injected CSS, event delegation for mouse/keyboard
- **French frequency list** — 500 words with translations, POS, gender (`public/data/frequencies/fr.json`)
- **Language config** — 8 Tier 1 languages with accent colors, TTS lang codes
- **Utility libraries** — text tokenizer (Unicode-aware), throttle, DOM eligibility checker
- **Content script entry** — Wires everything together: loads settings, checks domain blocklist, loads frequency data, processes page, listens for messages

**Architecture decisions:**
- Reverse-lookup approach: frequency list maps French→English, we build a reverse map English→French at runtime for matching page words
- Shadow DOM for overlay: completely isolates hover card styles from host page
- Event delegation: single mouseover/mouseout listener on document, not per-element

**Build result:** ✅ `npm run build` succeeds (991ms)
**Content script bundle:** 12.3KB (gzip: 4.7KB) + 140KB React runtime

**Issues:**
- Had to move frequency JSON to `public/` so it's served as a static file (not bundled inline)
- TypeScript strict mode caught the `unknown[]` vs `MutationRecord[]` type mismatch in throttle — fixed with `any`

**Next:** Phase 3 — Storage & SRS

---

## Phase 3: Storage & SRS ✅
**Date:** 2026-02-16

**What was built:**
- **Chrome Storage wrapper** (`lib/storage/chrome.ts`) — Settings (sync), daily stats (local), streak tracking with day-continuity logic
- **IndexedDB wrapper** (`lib/storage/idb.ts`) — Three stores: vocabulary (with indexes by state/nextReview/lang), translations cache, encounters log. Full CRUD operations.
- **SM-2 Algorithm** (`lib/srs/sm2.ts`) — Standard SuperMemo 2 implementation: ease factor, interval, repetition tracking. States: new→learning→reviewing→mastered. Passive encounter bonus.
- **SRS Scheduler** (`lib/srs/scheduler.ts`) — High-level API: addWord, submitReview, recordEncounter, getDueReviews, getKnownWords, getLearningWords

**Build result:** ✅ `npm run build` succeeds (919ms)

**Next:** Phase 4 — Translation API Integration

---

## Phase 4: Translation API Integration ✅
**Date:** 2026-02-16

**What was built:**
- **MyMemory API adapter** — Free translation API (5000 words/day), simple GET requests
- **Lingva Translate adapter** — Open-source fallback when MyMemory fails
- **Translation cache** — IndexedDB-backed, never translates the same word twice
- **Unified API layer** — Batch translation with caching, rate limiting (100ms between batches), automatic fallback chain: cache → MyMemory → Lingva → fail gracefully

**Build result:** ✅

---

## Phase 5: Popup Dashboard ✅
**Date:** 2026-02-16

**What was built:**
- Full React popup (360×480) with dark mode UI
- **StatsCard** — Today's words seen, learned, reviews due (live from Chrome Storage)
- **StreakBadge** — Flame icon with day count, active/inactive states
- **IntensitySlider** — 5-50% range, styled custom slider, updates settings in real-time
- **LanguageSelector** — Dropdown with all 8 Tier 1 languages (flags + names)
- **Pause/Resume toggle** — Sends PAUSE/RESUME messages to content scripts
- **Start Lesson / Recite Page** buttons
- All controls immediately sync settings to Chrome Storage and notify active tabs

**Build result:** ✅

---

## Phase 6: Pronunciation Engine ✅
**Date:** 2026-02-16

**What was built:**
- **TTS wrapper** (`lib/audio/tts.ts`) — Web Speech API with async speak(), cancel support, error handling
- **Voice selector** (`lib/audio/voices.ts`) — Prefers enhanced/premium local voices, caches per language
- **Click-to-speak** — Clicking any replaced word plays pronunciation via TTS
- Integrated with content script: uses settings for rate/volume, language config for TTS lang code

**Build result:** ✅

---

## Phase 7: Quiz System ✅
**Date:** 2026-02-16

**What was built:**
- **QuizToast component** — Bottom-right toast with slide-in animation
- **Multiple choice** — 4 options (1 correct + 3 distractors from frequency list), click to answer
- **Type-the-answer** — Text input with submit, checks against correct answer
- **Result feedback** — Green/red flash with correct answer shown on incorrect
- **Auto-dismiss** — 30 second timeout if ignored
- **Snooze** — 30 minute snooze button
- **Quiz timer** — Shows quiz every 15 minutes (configurable), initial 5 min delay
- Full styling in Shadow DOM (isolated from page)

**Build result:** ✅

---

## Phase 8: Settings/Options Page ✅
**Date:** 2026-02-16

**What was built:**
- Full React options page with **sidebar navigation** (Language, Immersion, Audio, Quizzes, Data, About)
- **LanguagePage** — 8 language cards with flags, 6 CEFR proficiency levels (A1-C2)
- **ImmersionPage** — Enable/disable toggle, intensity slider, highlight style picker, domain blocklist with add/remove
- **AudioPage** — Auto-pronounce toggle, speech speed slider (0.5-2.0x), volume slider
- **QuizPage** — Enable toggle, 3 quiz type checkboxes, frequency selector (5/15/30/60 min)
- **DataPage** — Export as JSON, export for Anki (TSV), import from JSON, clear all data (with confirmation)
- **AboutPage** — Version info, description, privacy note
- All settings immediately persist to Chrome Storage and notify all tabs
- "Settings saved" toast notification
- Beautiful dark mode UI consistent with design system

**Build result:** ✅ `npm run build` succeeds (1.08s)
**Final bundle sizes:**
- Content script: 19.4KB (gzip: 6.5KB)
- Popup: 7.5KB (gzip: 2.6KB)
- Options: 24.9KB (gzip: 6.8KB)
- Shared React runtime: 141.7KB (gzip: 45.8KB)
- CSS: 26.8KB (gzip: 5.1KB)
- Total extension: ~220KB uncompressed
