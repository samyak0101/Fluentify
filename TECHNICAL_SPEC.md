# Fluentify v2 — Technical Specification

---

## 1. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Language | TypeScript 5.x | Type safety, better DX, catches bugs early |
| UI Framework | React 18 | Popup + options page, component reuse |
| Styling | Tailwind CSS 3.x | Utility-first, dark mode, fast iteration |
| Build | Vite 5 + CRXJS | Fast HMR, Chrome extension support out of the box |
| State | Zustand | Lightweight, works great with Chrome Storage |
| SRS Algorithm | Custom SM-2 | No dependency needed, ~100 lines |
| Animation | Framer Motion | Smooth hover cards, quiz toasts, transitions |
| Icons | Lucide React | Clean, consistent, tree-shakeable |
| Testing | Vitest + Testing Library | Fast, Vite-native |
| Linting | ESLint + Prettier | Code consistency |

---

## 2. File Structure

```
fluentify-v2/
├── public/
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── _locales/              # i18n for store listing
│       └── en/
│           └── messages.json
├── src/
│   ├── manifest.ts            # Manifest V3 (CRXJS format)
│   ├── background/
│   │   └── service-worker.ts  # Background service worker
│   ├── content/
│   │   ├── index.ts           # Content script entry
│   │   ├── immersion/
│   │   │   ├── scanner.ts     # DOM text node scanner
│   │   │   ├── replacer.ts    # Word replacement engine
│   │   │   ├── selector.ts    # Smart word selection (i+1)
│   │   │   └── observer.ts    # MutationObserver for SPAs
│   │   ├── overlay/
│   │   │   ├── HoverCard.tsx   # Floating translation card
│   │   │   ├── QuizToast.tsx   # Quiz notification
│   │   │   ├── ReciteBar.tsx   # Recite mode controls
│   │   │   └── mount.ts       # Shadow DOM mount point
│   │   └── styles/
│   │       └── content.css    # Injected styles (minimal)
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── StatsCard.tsx
│   │       ├── IntensitySlider.tsx
│   │       ├── StreakBadge.tsx
│   │       ├── QuickActions.tsx
│   │       └── LanguageSelector.tsx
│   ├── options/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── pages/
│   │       ├── LanguagePage.tsx
│   │       ├── ImmersionPage.tsx
│   │       ├── AudioPage.tsx
│   │       ├── QuizPage.tsx
│   │       ├── VocabBrowser.tsx
│   │       └── DataPage.tsx
│   ├── lib/
│   │   ├── srs/
│   │   │   ├── sm2.ts          # SM-2 algorithm implementation
│   │   │   ├── scheduler.ts    # Review scheduling
│   │   │   └── types.ts        # Word, ReviewResult types
│   │   ├── translation/
│   │   │   ├── api.ts          # Translation API client
│   │   │   ├── cache.ts        # Translation cache (IndexedDB)
│   │   │   ├── mymemory.ts     # MyMemory API adapter
│   │   │   ├── lingva.ts       # Lingva Translate adapter
│   │   │   └── types.ts
│   │   ├── audio/
│   │   │   ├── tts.ts          # Web Speech API TTS wrapper
│   │   │   ├── stt.ts          # Web Speech API STT wrapper
│   │   │   └── voices.ts       # Voice selection logic
│   │   ├── storage/
│   │   │   ├── chrome.ts       # Chrome Storage API wrapper
│   │   │   ├── idb.ts          # IndexedDB wrapper (vocabulary)
│   │   │   ├── sync.ts         # Sync between storage layers
│   │   │   └── migrations.ts   # Data migration between versions
│   │   ├── words/
│   │   │   ├── frequency.ts    # Word frequency lookup
│   │   │   └── pos.ts          # Basic part-of-speech tagging
│   │   └── utils/
│   │       ├── dom.ts          # DOM traversal helpers
│   │       ├── text.ts         # Text processing (tokenization)
│   │       ├── throttle.ts     # Performance helpers
│   │       └── i18n.ts         # Internationalization
│   ├── data/
│   │   ├── frequencies/
│   │   │   ├── fr.json         # Top 5000 French words with translations
│   │   │   ├── es.json
│   │   │   ├── de.json
│   │   │   └── ...
│   │   └── config/
│   │       └── languages.ts    # Language configs (voices, scripts, etc.)
│   ├── hooks/
│   │   ├── useStorage.ts       # React hook for Chrome Storage
│   │   ├── useVocabulary.ts    # React hook for word operations
│   │   ├── useStats.ts         # React hook for statistics
│   │   └── useTTS.ts           # React hook for text-to-speech
│   └── types/
│       ├── index.ts            # Shared types
│       ├── messages.ts         # Chrome message types
│       └── settings.ts         # Settings schema
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Manifest V3

```typescript
// src/manifest.ts (CRXJS format)
import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Fluentify — Learn Languages While You Browse',
  version: '1.0.0',
  description: 'Transform any webpage into a language lesson. Learn vocabulary naturally through immersion, spaced repetition, and audio.',
  
  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
    },
  },
  
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      css: ['src/content/styles/content.css'],
      run_at: 'document_idle',
    },
  ],
  
  permissions: [
    'storage',
    'activeTab',
    'tts',
    'alarms',        // For SRS review reminders
  ],
  
  options_page: 'src/options/index.html',
  
  web_accessible_resources: [
    {
      resources: ['data/frequencies/*.json'],
      matches: ['<all_urls>'],
    },
  ],
});
```

---

## 4. Core Components

### 4.1 Content Script — Immersion Engine

#### Scanner (`content/immersion/scanner.ts`)
Walks the DOM to find text nodes suitable for replacement:

```typescript
// Pseudocode
export function scanPage(): TextNodeInfo[] {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // Skip: scripts, styles, inputs, contenteditable, code blocks
        // Skip: hidden elements, very short text
        // Skip: elements with data-fluentify-skip attribute
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        const tag = parent.tagName;
        const skipTags = ['SCRIPT','STYLE','TEXTAREA','INPUT','CODE','PRE','KBD','NOSCRIPT'];
        if (skipTags.includes(tag)) return NodeFilter.FILTER_REJECT;
        if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-fluentify-skip]')) return NodeFilter.FILTER_REJECT;
        
        const text = node.textContent?.trim();
        if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes: TextNodeInfo[] = [];
  let node: Text | null;
  while (node = walker.nextNode() as Text) {
    nodes.push({
      node,
      text: node.textContent!,
      words: tokenize(node.textContent!),
    });
  }
  return nodes;
}
```

#### Word Selector (`content/immersion/selector.ts`)
Picks which words to replace based on i+1 principle:

```typescript
export function selectWordsForReplacement(
  words: string[],
  knownWords: Set<string>,
  learningWords: Set<string>,
  frequencyMap: Map<string, number>,
  intensity: number, // 0.05 to 0.50
): WordSelection[] {
  const candidates = words.filter(w => {
    const normalized = w.toLowerCase();
    // Skip: too short, numbers, proper nouns (crude: starts with capital mid-sentence)
    if (normalized.length < 3) return false;
    if (/^\d+$/.test(normalized)) return false;
    // Skip already mastered words (show them sometimes for reinforcement)
    if (knownWords.has(normalized) && Math.random() > 0.1) return false;
    return true;
  });

  // Sort by learning priority:
  // 1. Words currently in "learning" state (reinforce)
  // 2. High-frequency unknown words (most useful to learn)
  // 3. Medium-frequency unknown words
  const scored = candidates.map(w => ({
    word: w,
    score: learningWords.has(w.toLowerCase()) ? 100 :
           (frequencyMap.get(w.toLowerCase()) ?? 0),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  const count = Math.ceil(candidates.length * intensity);
  return scored.slice(0, count).map(s => ({
    original: s.word,
    // Translation fetched async via background worker
  }));
}
```

#### Replacer (`content/immersion/replacer.ts`)
Replaces selected words in the DOM with translated versions:

```typescript
export function replaceWord(
  textNode: Text,
  original: string,
  translation: string,
  wordId: string,
): void {
  const span = document.createElement('span');
  span.className = 'fluentify-word';
  span.dataset.fluentifyId = wordId;
  span.dataset.original = original;
  span.dataset.translation = translation;
  span.textContent = translation;
  span.setAttribute('role', 'button');
  span.setAttribute('tabindex', '0');
  span.setAttribute('aria-label', `${translation} (${original})`);
  
  // Split the text node and insert the span
  const idx = textNode.textContent!.indexOf(original);
  if (idx === -1) return;
  
  const before = textNode.textContent!.slice(0, idx);
  const after = textNode.textContent!.slice(idx + original.length);
  
  const beforeNode = document.createTextNode(before);
  const afterNode = document.createTextNode(after);
  
  const parent = textNode.parentNode!;
  parent.replaceChild(afterNode, textNode);
  parent.insertBefore(span, afterNode);
  parent.insertBefore(beforeNode, span);
}
```

#### MutationObserver (`content/immersion/observer.ts`)
Handles SPAs and dynamically loaded content:

```typescript
export function observeDOM(onNewContent: () => void): MutationObserver {
  const observer = new MutationObserver(
    throttle((mutations: MutationRecord[]) => {
      const hasNewText = mutations.some(m =>
        m.addedNodes.length > 0 ||
        m.type === 'characterData'
      );
      if (hasNewText) onNewContent();
    }, 1000) // Max once per second
  );

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}
```

### 4.2 Hover Card — Shadow DOM React Component

The hover card renders inside a Shadow DOM to avoid style conflicts:

```typescript
// content/overlay/mount.ts
export function mountOverlay(): ShadowRoot {
  const host = document.createElement('div');
  host.id = 'fluentify-overlay';
  host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(host);
  
  const shadow = host.attachShadow({ mode: 'closed' });
  
  // Inject Tailwind styles into shadow root
  const style = document.createElement('style');
  style.textContent = OVERLAY_STYLES; // Compiled Tailwind subset
  shadow.appendChild(style);
  
  const root = document.createElement('div');
  root.id = 'fluentify-root';
  shadow.appendChild(root);
  
  // Mount React
  createRoot(root).render(<OverlayApp />);
  
  return shadow;
}
```

```tsx
// content/overlay/HoverCard.tsx
interface HoverCardProps {
  word: string;
  translation: string;
  pronunciation?: string;
  position: { x: number; y: number };
  onAddToDeck: () => void;
  onPlayAudio: () => void;
  onDismiss: () => void;
}

export function HoverCard({ word, translation, pronunciation, position, onAddToDeck, onPlayAudio, onDismiss }: HoverCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="fixed pointer-events-auto"
      style={{ left: position.x, top: position.y }}
    >
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl min-w-[200px] max-w-[280px]">
        {/* Target language word */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg font-semibold text-white">{word}</span>
          <button
            onClick={onPlayAudio}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Play pronunciation"
          >
            <Volume2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
        
        {/* Translation */}
        <p className="text-sm text-white/60 mb-1">→ {translation}</p>
        
        {/* Pronunciation */}
        {pronunciation && (
          <p className="text-xs text-white/40 font-mono mb-3">{pronunciation}</p>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onAddToDeck}
            className="flex-1 text-xs py-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            + Add to deck
          </button>
          <button
            onClick={onDismiss}
            className="text-xs py-1.5 px-3 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

### 4.3 Background Service Worker

```typescript
// background/service-worker.ts
import { TranslationAPI } from '../lib/translation/api';
import { SRSScheduler } from '../lib/srs/scheduler';
import { StorageManager } from '../lib/storage/chrome';

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TRANSLATE_WORDS':
      handleTranslation(message.words, message.targetLang, message.sourceLang)
        .then(sendResponse);
      return true; // async response
      
    case 'ADD_WORD':
      handleAddWord(message.word)
        .then(sendResponse);
      return true;
      
    case 'GET_DUE_REVIEWS':
      handleGetDueReviews()
        .then(sendResponse);
      return true;
      
    case 'SUBMIT_REVIEW':
      handleSubmitReview(message.wordId, message.quality)
        .then(sendResponse);
      return true;
      
    case 'GET_SETTINGS':
      StorageManager.getSettings()
        .then(sendResponse);
      return true;
      
    case 'GET_STATS':
      handleGetStats()
        .then(sendResponse);
      return true;
  }
});

// Translation with caching
async function handleTranslation(
  words: string[],
  targetLang: string,
  sourceLang: string,
): Promise<Map<string, TranslationResult>> {
  const results = new Map();
  const uncached: string[] = [];
  
  // Check cache first
  for (const word of words) {
    const cached = await TranslationCache.get(word, targetLang);
    if (cached) {
      results.set(word, cached);
    } else {
      uncached.push(word);
    }
  }
  
  // Batch translate uncached words
  if (uncached.length > 0) {
    const translations = await TranslationAPI.translateBatch(
      uncached, sourceLang, targetLang
    );
    for (const [word, result] of translations) {
      await TranslationCache.set(word, targetLang, result);
      results.set(word, result);
    }
  }
  
  return results;
}

// SRS review alarm
chrome.alarms.create('srs-check', { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'srs-check') {
    const dueCount = await SRSScheduler.getDueCount();
    if (dueCount > 0) {
      chrome.action.setBadgeText({ text: String(dueCount) });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});
```

### 4.4 Translation API Layer

```typescript
// lib/translation/mymemory.ts
const MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';

export async function translateMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
  });
  
  const response = await fetch(`${MYMEMORY_BASE}?${params}`);
  const data = await response.json();
  
  if (data.responseStatus === 200) {
    return data.responseData.translatedText;
  }
  throw new Error(`Translation failed: ${data.responseStatus}`);
}

// lib/translation/api.ts — Adapter with fallback
export class TranslationAPI {
  static async translateBatch(
    words: string[],
    sourceLang: string,
    targetLang: string,
  ): Promise<Map<string, TranslationResult>> {
    const results = new Map();
    
    // Batch into groups of 10 to avoid rate limits
    for (const batch of chunk(words, 10)) {
      const promises = batch.map(async (word) => {
        try {
          const translation = await translateMyMemory(word, sourceLang, targetLang);
          return { word, translation, source: 'mymemory' as const };
        } catch {
          // Fallback to Lingva
          try {
            const translation = await translateLingva(word, sourceLang, targetLang);
            return { word, translation, source: 'lingva' as const };
          } catch {
            return { word, translation: word, source: 'failed' as const };
          }
        }
      });
      
      const batchResults = await Promise.all(promises);
      for (const result of batchResults) {
        results.set(result.word, result);
      }
      
      // Rate limit: wait 100ms between batches
      await new Promise(r => setTimeout(r, 100));
    }
    
    return results;
  }
}
```

### 4.5 Translation Cache (IndexedDB)

```typescript
// lib/storage/idb.ts
import { openDB, DBSchema } from 'idb';

interface FluentifyDB extends DBSchema {
  translations: {
    key: string; // `${word}:${targetLang}`
    value: {
      word: string;
      targetLang: string;
      translation: string;
      pronunciation?: string;
      partOfSpeech?: string;
      cachedAt: number;
    };
    indexes: { 'by-lang': string };
  };
  vocabulary: {
    key: string; // word ID
    value: Word; // Full Word interface from product spec
    indexes: {
      'by-state': string;
      'by-next-review': number;
      'by-lang': string;
    };
  };
  encounters: {
    key: number; // auto-increment
    value: {
      wordId: string;
      url: string;
      sentence: string;
      timestamp: number;
    };
  };
}

const DB_NAME = 'fluentify';
const DB_VERSION = 1;

export async function getDB() {
  return openDB<FluentifyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Translations cache
      const txStore = db.createObjectStore('translations', { keyPath: 'key' });
      txStore.createIndex('by-lang', 'targetLang');
      
      // Vocabulary (SRS)
      const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
      vocabStore.createIndex('by-state', 'state');
      vocabStore.createIndex('by-next-review', 'nextReview');
      vocabStore.createIndex('by-lang', 'targetLang');
      
      // Encounter log
      db.createObjectStore('encounters', {
        keyPath: 'id',
        autoIncrement: true,
      });
    },
  });
}
```

### 4.6 SRS Engine

```typescript
// lib/srs/sm2.ts
export interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
}

export function calculateNextReview(
  word: Word,
  result: ReviewResult,
): Partial<Word> {
  const { quality } = result;
  let { easeFactor, interval, repetition } = word;
  
  if (quality >= 3) {
    // Correct response
    switch (repetition) {
      case 0: interval = 1; break;
      case 1: interval = 6; break;
      default: interval = Math.round(interval * easeFactor);
    }
    repetition++;
  } else {
    // Incorrect — reset
    repetition = 0;
    interval = 1;
  }
  
  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);
  
  // Determine state
  let state: Word['state'];
  if (repetition === 0) state = 'learning';
  else if (interval < 21) state = 'reviewing';
  else state = 'mastered';
  
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  
  return {
    easeFactor,
    interval,
    repetition,
    nextReview,
    state,
    timesReviewed: word.timesReviewed + 1,
    correctStreak: quality >= 3 ? word.correctStreak + 1 : 0,
  };
}
```

### 4.7 TTS Wrapper

```typescript
// lib/audio/tts.ts
export class FluentifyTTS {
  private synth = window.speechSynthesis;
  private voiceCache = new Map<string, SpeechSynthesisVoice>();
  
  async speak(
    text: string,
    lang: string,
    options: { rate?: number; volume?: number } = {},
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = options.rate ?? 0.9; // Slightly slower for learning
      utterance.volume = options.volume ?? 0.8;
      
      // Select best voice for language
      const voice = this.getBestVoice(lang);
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      
      this.synth.speak(utterance);
    });
  }
  
  private getBestVoice(lang: string): SpeechSynthesisVoice | null {
    if (this.voiceCache.has(lang)) return this.voiceCache.get(lang)!;
    
    const voices = this.synth.getVoices();
    // Prefer: 1) Premium/enhanced voices, 2) Native voices, 3) Any match
    const match = voices
      .filter(v => v.lang.startsWith(lang))
      .sort((a, b) => {
        // Prefer non-network voices (faster)
        if (a.localService && !b.localService) return -1;
        if (!a.localService && b.localService) return 1;
        // Prefer voices with "Enhanced" or "Premium" in name
        const aEnhanced = /enhanced|premium|neural/i.test(a.name);
        const bEnhanced = /enhanced|premium|neural/i.test(b.name);
        if (aEnhanced && !bEnhanced) return -1;
        if (!aEnhanced && bEnhanced) return 1;
        return 0;
      })[0] ?? null;
    
    if (match) this.voiceCache.set(lang, match);
    return match;
  }
  
  getAvailableVoices(lang: string): SpeechSynthesisVoice[] {
    return this.synth.getVoices().filter(v => v.lang.startsWith(lang));
  }
}
```

---

## 5. State Management

### Zustand Store (Popup & Options)

```typescript
// hooks/useStorage.ts
import { create } from 'zustand';

interface FluentifyState {
  // Settings
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  
  // Stats
  stats: DailyStats;
  refreshStats: () => Promise<void>;
  
  // Vocabulary
  dueReviews: Word[];
  refreshDueReviews: () => Promise<void>;
  
  // UI state
  isPaused: boolean;
  togglePause: () => void;
}

export const useFluentifyStore = create<FluentifyState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
  dueReviews: [],
  isPaused: false,

  updateSettings: async (partial) => {
    const newSettings = { ...get().settings, ...partial };
    await chrome.storage.sync.set({ settings: newSettings });
    set({ settings: newSettings });
    // Notify content scripts
    chrome.tabs.query({ active: true }, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED', settings: newSettings
        });
      });
    });
  },
  
  refreshStats: async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    set({ stats: response });
  },
  
  refreshDueReviews: async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_DUE_REVIEWS' });
    set({ dueReviews: response });
  },
  
  togglePause: async () => {
    const isPaused = !get().isPaused;
    await chrome.storage.local.set({ isPaused });
    set({ isPaused });
  },
}));
```

### Chrome Message Protocol

All communication between content script ↔ background ↔ popup uses typed messages:

```typescript
// types/messages.ts
type Message =
  | { type: 'TRANSLATE_WORDS'; words: string[]; targetLang: string; sourceLang: string }
  | { type: 'ADD_WORD'; word: AddWordPayload }
  | { type: 'RECORD_ENCOUNTER'; wordId: string; url: string; sentence: string }
  | { type: 'GET_DUE_REVIEWS' }
  | { type: 'SUBMIT_REVIEW'; wordId: string; quality: 0|1|2|3|4|5 }
  | { type: 'GET_SETTINGS' }
  | { type: 'SETTINGS_UPDATED'; settings: Settings }
  | { type: 'GET_STATS' }
  | { type: 'GET_KNOWN_WORDS'; lang: string }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };
```

---

## 6. Settings Schema

```typescript
// types/settings.ts
export interface Settings {
  // Language
  targetLanguage: string;      // ISO 639-1: "fr", "es", "de"
  nativeLanguage: string;      // Default: "en"
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  
  // Immersion
  immersionEnabled: boolean;
  immersionIntensity: number;  // 0.05 to 0.50
  replaceMode: 'words' | 'phrases' | 'sentences';
  
  // Audio
  autoPronouce: boolean;       // Auto-play TTS on hover
  ttsRate: number;             // 0.5 to 2.0
  ttsVolume: number;           // 0 to 1
  preferredVoice?: string;     // Voice URI
  
  // Quiz
  quizEnabled: boolean;
  quizFrequencyMinutes: number; // How often to show quiz toast
  quizTypes: ('multipleChoice' | 'typeAnswer' | 'listenType')[];
  
  // Display
  theme: 'dark' | 'light' | 'system';
  highlightStyle: 'underline' | 'background' | 'italic';
  showPronunciation: boolean;
  
  // Sites
  enabledDomains: string[];    // Empty = all domains
  disabledDomains: string[];   // Blocklist
  
  // Data
  syncEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  targetLanguage: 'fr',
  nativeLanguage: 'en',
  proficiencyLevel: 'A1',
  immersionEnabled: true,
  immersionIntensity: 0.15,
  replaceMode: 'words',
  autoPronouce: false,
  ttsRate: 0.9,
  ttsVolume: 0.8,
  quizEnabled: true,
  quizFrequencyMinutes: 15,
  quizTypes: ['multipleChoice'],
  theme: 'dark',
  highlightStyle: 'underline',
  showPronunciation: true,
  enabledDomains: [],
  disabledDomains: ['mail.google.com', 'docs.google.com', 'github.com'],
  syncEnabled: true,
};
```

---

## 7. Build System

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html',
      },
    },
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0A0A0A',
          1: '#111111',
          2: '#1A1A1A',
          3: '#222222',
          4: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#10B981', // Emerald
          hover: '#059669',
        },
        // Language-specific accent overrides applied via CSS variables
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'confetti': 'confetti 0.6s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Package.json

```json
{
  "name": "fluentify-v2",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "idb": "^8.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.25",
    "@tailwindcss/vite": "^4.0.0",
    "@types/chrome": "^0.0.270",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "tailwindcss": "^4.0.0",
    "terser": "^5.31.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

---

## 8. Content Script Injection Strategy

### Performance Considerations
- **Idle injection** (`run_at: 'document_idle'`) — doesn't block page load
- **Throttled scanning** — scan once on load, then only on significant DOM changes
- **Web Workers** — offload word selection/frequency lookup to a worker (if needed)
- **Translation batching** — collect all words, translate in one batch, then apply
- **LRU Translation Cache** — IndexedDB cache means most words are instant after first lookup

### Page Compatibility
- **SPA Support**: MutationObserver watches for new content (React, Vue, etc.)
- **Shadow DOM**: Skip shadow roots (they're usually component internals)
- **iframes**: Don't inject into iframes (too complex, low value)
- **Infinite scroll**: Observer catches new content as it loads
- **CSP**: All code runs as content script (exempt from page CSP)

### DOM Safety
- Never modify form inputs, contenteditable elements, or code blocks
- Store original text in `data-*` attributes for perfect restoration
- Cleanup function restores all modifications when extension is paused/disabled
- Use `requestIdleCallback` for non-urgent DOM updates

---

## 9. Word Frequency Data

### Source
Use open-source word frequency lists from [Hermit Dave's frequency lists](https://github.com/hermitdave/FrequencyWords/) (CC-BY-SA):

### Format (bundled JSON)
```typescript
// data/frequencies/fr.json (excerpt)
{
  "words": [
    { "w": "de", "r": 1, "t": "of/from", "p": "prep" },
    { "w": "la", "r": 2, "t": "the", "p": "art" },
    { "w": "le", "r": 3, "t": "the", "p": "art" },
    { "w": "et", "r": 4, "t": "and", "p": "conj" },
    { "w": "les", "r": 5, "t": "the", "p": "art" },
    // ... top 5000 words
    { "w": "maison", "r": 247, "t": "house", "p": "n", "g": "f" },
  ]
}
```

Fields: `w` = word, `r` = frequency rank, `t` = translation, `p` = part of speech, `g` = gender (if applicable)

### Size Budget
- ~50KB per language (gzipped) for top 5000 words
- 8 languages at launch = ~400KB total
- Loaded on-demand (only active language loaded into memory)

---

## 10. Testing Strategy

### Unit Tests (Vitest)
- SRS algorithm: verify interval calculations, edge cases
- Word selector: verify i+1 selection, intensity percentages
- Translation cache: verify hit/miss, TTL expiry
- Text tokenizer: verify word splitting across languages

### Integration Tests
- Content script: mock DOM, verify word replacement and restoration
- Background worker: mock Chrome APIs, verify message handling
- Storage: verify sync between Chrome Storage and IndexedDB

### E2E Tests (Playwright)
- Load extension in Chrome
- Navigate to a test page
- Verify words are replaced
- Hover and verify card appears
- Click "Add to deck" and verify storage
- Open popup and verify stats

### Test Coverage Target
- Core libraries (SRS, translation, storage): >90%
- UI components: >70%
- Content script: >60%

---

## 11. Security & Privacy

- **No external analytics** — zero tracking in MVP
- **No account system** — no auth, no server, no data leaves the browser
- **Minimal permissions** — only `storage`, `activeTab`, `tts`, `alarms`
- **Translation API calls** — only word/phrase text sent (no URLs, no page content)
- **Local-first** — all vocabulary data stored in Chrome Storage + IndexedDB
- **CSP compliant** — no eval(), no inline scripts in extension pages
- **Shadow DOM isolation** — overlay styles can't leak into or from the page

---

## 12. Performance Budget

| Metric | Target |
|--------|--------|
| Content script initial load | < 50ms |
| Page scan + word selection | < 200ms |
| Translation batch (cached) | < 10ms |
| Translation batch (API) | < 2s |
| Hover card render | < 16ms (one frame) |
| Popup open to interactive | < 100ms |
| Memory usage (content script) | < 10MB |
| Extension bundle size | < 2MB |

---

## 13. Development Workflow

```bash
# Setup
git clone <repo> && cd fluentify-v2
npm install

# Development (HMR)
npm run dev
# → Load dist/ folder as unpacked extension in chrome://extensions

# Build for production
npm run build
# → Output in dist/ ready for Chrome Web Store

# Test
npm test
npm run test:coverage

# Lint + typecheck
npm run lint
npm run typecheck

# Package for Chrome Web Store
cd dist && zip -r ../fluentify-v2.zip .
```

---

## 14. Deployment Checklist

- [ ] All tests passing
- [ ] Bundle size < 2MB
- [ ] No console.log statements
- [ ] Privacy policy page hosted
- [ ] Store listing assets ready (screenshots, video, description)
- [ ] Manifest permissions justified in store submission
- [ ] Version bumped in manifest
- [ ] Changelog updated
- [ ] ZIP created from `dist/`
- [ ] Submitted to Chrome Web Store Developer Dashboard
- [ ] Review typically takes 1-3 business days
