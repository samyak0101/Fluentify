<div align="center">

<img src="public/icons/icon-128.png" alt="Fluentify" width="80" height="80" />

# Fluentify

**The invisible language teacher that lives in your browser.**

Transform any webpage into a language lesson — passively, beautifully, without interrupting your flow.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Coming%20Soon-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://github.com/samyak0101/fluentify)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-10B981?style=flat-square)](CONTRIBUTING.md)

[Features](#features) · [Install](#install) · [How It Works](#how-it-works) · [Contributing](#contributing) · [Roadmap](#roadmap)

---

![Fluentify demo — French words appearing inline on a webpage](docs/demo-placeholder.png)

> *Browsing a news article. French words appear quietly. You hover and hear the pronunciation. You didn't open a single app.*

</div>

---

## Why Fluentify?

Language learning apps fail because they exist *outside* your life. You open Duolingo for 5 minutes, close it, and forget everything by morning.

Real acquisition happens through **immersion** — surrounding yourself with the language in natural contexts. But most people can't move to Paris.

You do, however, spend 6+ hours a day in your browser.

Fluentify turns that time into language learning — quietly, without asking you to change your habits.

---

## Features

### 🌊 Immersion Mode
Fluentify replaces a configurable percentage of words on any webpage with your target language. Reading a news article? Some words are now French. The page still makes sense. You're learning.

- Smart word selection using frequency lists + your current level (Krashen's i+1)
- Dotted underline marks replaced words — subtle, not jarring
- Hover any word to see a translation card with pronunciation
- Click to hear it spoken aloud
- Adjust intensity from 5% (gentle) to 50% (immersive)

### 🧠 Spaced Repetition (SRS)
Every word you encounter is tracked and scheduled for optimal review.

- Modified SM-2 algorithm (the same science behind Anki)
- Words progress: `New → Learning → Reviewing → Mastered`
- Passive encounters on pages count as soft reviews
- Context saved: you'll always see the word in the sentence where you first learned it

### 🔊 Pronunciation
- Click any replaced word to hear it via Web Speech API
- Auto-pronounce as you scroll (optional)
- Speed control (0.5x – 2.0x)
- Prefers high-quality neural voices when available

### 🎯 Quiz Toasts
Gentle quizzes appear in the bottom corner while you browse.

- Multiple choice: what does this word mean?
- Type-the-answer mode
- Configurable frequency (every 5 / 15 / 30 / 60 minutes)
- Auto-dismiss, snooze — never intrusive

### 📊 Popup Dashboard
Click the extension icon for a clean dashboard:
- Today's words seen, learned, reviews due
- Streak counter
- Intensity control
- Language switcher

### ⚙️ Full Settings
- 8 languages (French, Spanish, German, Italian, Portuguese, Japanese, Korean, Mandarin)
- Proficiency levels A1–C2
- Domain allow/blocklist (disable on work apps, banking, etc.)
- Data export: JSON or Anki-compatible TSV
- No account required. All data stays in your browser.

---

## Install

### From Chrome Web Store
> Coming soon — submit in progress.

### Manual Install (Developer Mode)
```bash
# Clone
git clone https://github.com/samyak0101/fluentify.git
cd fluentify

# Install dependencies
npm install

# Build
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions
# 2. Enable "Developer mode" (top right)
# 3. Click "Load unpacked"
# 4. Select the `dist/` folder
```

---

## How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                         Your Browser                             │
│                                                                  │
│  ┌────────────────────────┐    ┌──────────────────────────────┐  │
│  │     Any Webpage        │    │    Fluentify Extension       │  │
│  │                        │    │                              │  │
│  │  "The cat sat on       │ ←→ │  Content Script:             │  │
│  │   the tapis"           │    │  - Scans text nodes          │  │
│  │        ^^^^^^          │    │  - Selects words by level    │  │
│  │   [dotted underline]   │    │  - Replaces inline           │  │
│  │                        │    │  - Mounts hover card (ShadowDOM) │
│  └────────────────────────┘    │                              │  │
│                                │  Background Worker:          │  │
│  ┌────────────────────────┐    │  - SRS scheduler             │  │
│  │   Hover Card           │    │  - Translation cache         │  │
│  │  ┌──────────────────┐  │    │  - Quiz timing               │  │
│  │  │ 🇫🇷 tapis         │  │    │                              │  │
│  │  │  → mat/carpet    │  │    │  Chrome Storage:             │  │
│  │  │  /ta.pi/ 🔊      │  │    │  - Settings (sync)           │  │
│  │  │  noun · masc.    │  │    │  - Vocabulary (local + IDB)  │  │
│  │  │ [+ Add] [Skip]   │  │    │  - Stats & streaks           │  │
│  │  └──────────────────┘  │    │                              │  │
│  └────────────────────────┘    └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Zero backend.** Everything runs in your browser. No account, no server, no data sent anywhere.

Translation uses [MyMemory](https://mymemory.translated.net/) (free, 5000 words/day) with [Lingva](https://github.com/thedaviddelta/lingva-translate) as fallback. Once a word is translated, it's cached forever in IndexedDB.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5 (strict) |
| UI | React 18 + Tailwind CSS |
| Build | Vite 5 + CRXJS |
| Animation | Framer Motion |
| Storage | Chrome Storage API + IndexedDB |
| SRS | Custom SM-2 implementation |
| Translation | MyMemory API + Lingva (free) |
| Audio | Web Speech API (built-in to Chrome) |

---

## Languages Supported

| Language | Flag | TTS | SRS | Frequency List |
|----------|------|-----|-----|----------------|
| French | 🇫🇷 | ✅ | ✅ | ✅ 500 words |
| Spanish | 🇪🇸 | ✅ | ✅ | ✅ 500 words |
| German | 🇩🇪 | ✅ | ✅ | ✅ 500 words |
| Italian | 🇮🇹 | ✅ | ✅ | ✅ 500 words |
| Portuguese | 🇵🇹 | ✅ | ✅ | ✅ 500 words |
| Japanese | 🇯🇵 | ✅ | ✅ | ✅ 500 words |
| Korean | 🇰🇷 | ✅ | ✅ | ✅ 500 words |
| Mandarin | 🇨🇳 | ✅ | ✅ | ✅ 500 words |

More languages via MyMemory API (80+ supported).

---

## Roadmap

### v1.0 (current)
- [x] Immersion mode — inline word replacement
- [x] Hover cards with translation + pronunciation
- [x] Spaced repetition (SM-2)
- [x] Translation API with caching
- [x] Popup dashboard
- [x] Quiz toasts
- [x] Full settings page
- [ ] Chrome Web Store submission
- [ ] Demo video + landing page

### v1.1
- [ ] Vocabulary browser in options page
- [ ] Anki export
- [ ] Streak animations
- [ ] More word frequency lists (1000+ words per language)

### v2.0
- [ ] Recite Mode — TTS reads the full page in target language
- [ ] Reading Mode — bilingual paragraph view
- [ ] Music Mode — song recommendations + lyric overlay on YouTube
- [ ] Speaking Practice — pronunciation check via STT
- [ ] Grammar hints on hover

See [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for the full vision.

---

## Contributing

Fluentify is open source and contributions are warmly welcome.

**Great first issues:**
- Add word frequency lists for new languages
- Improve hover card positioning edge cases
- Add more quiz types
- Write tests

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
git clone https://github.com/samyak0101/fluentify.git
cd fluentify
npm install
npm run dev   # Vite dev server with HMR
```

Then load `dist/` in Chrome as an unpacked extension (see [Install](#install)).

---

## Privacy

- **No account required**
- **No data collection** — your vocabulary lives in Chrome Storage, never sent anywhere
- **No tracking** — zero analytics
- **Minimal permissions** — `storage`, `activeTab`, `tts`, `alarms`
- **Open source** — verify everything yourself

---

## License

MIT © [Samyak Jain](https://samyakjain.tech)

---

<div align="center">

Made with ☕ and a lot of language-learning frustration.

If Fluentify helped you learn something, [give it a ⭐](https://github.com/samyak0101/fluentify)

</div>
