# Fluentify v2 — Product Specification

> **The invisible language teacher that lives in your browser.**

---

## 1. Vision & Philosophy

### The Problem
Language learning apps fail because they exist *outside* your life. You open Duolingo for 5 minutes, close it, and forget everything. Real language acquisition happens through **immersion** — being surrounded by the language in natural contexts, not artificial exercises.

### The Insight
People spend 6+ hours/day in their browser. That's 6 hours of potential immersion wasted. What if your browser *became* your language environment — subtly, beautifully, without interrupting your flow?

### The Vision
Fluentify transforms every webpage into a personalized language lesson. It replaces words you're ready to learn, reads pages aloud in your target language, quizzes you through gentle micro-interactions, and tracks your progress with a spaced repetition engine — all while staying completely out of your way.

### Design Philosophy
Inspired by Superwhisper's approach:
- **Invisible until needed** — no popups, no badges, no interruptions
- **Progressive disclosure** — show complexity only when the user asks for it
- **Feels like magic** — translations appear inline, audio plays naturally, quizzes feel like a game
- **Respect the page** — never break layouts, never feel like an overlay bolted on
- **Dark mode first** — premium, modern aesthetic (true black `#0A0A0A`)

### Core Principles
1. **Comprehensible Input (Krashen's i+1)** — Always show content slightly above the learner's level
2. **Spaced Repetition (Ebbinghaus)** — Review words at optimal intervals to maximize retention
3. **Dual Coding (Paivio)** — Pair words with visual context (the webpage itself), audio, and text
4. **Incidental Learning** — Learning happens as a side effect of doing what you already do
5. **Music & Rhythm** — Leverage the proven power of songs/rhythm for memory encoding

---

## 2. Competitive Analysis

### Toucan (by Babbel)
- ✅ Inline word replacement on any page — **closest to our core concept**
- ✅ Progressive difficulty, owned by Babbel (trusted brand)
- ❌ Text-only — no audio, no pronunciation
- ❌ No spaced repetition engine
- ❌ No reading/listening modes
- ❌ Basic UI, feels like an afterthought
- ❌ No quiz or active recall beyond passive reading

### Language Reactor
- ✅ Excellent for video-based learning (YouTube, Netflix)
- ✅ Dual subtitles, word saving
- ❌ Video-only — doesn't help with web browsing
- ❌ Heavy, complex UI
- ❌ No spaced repetition

### Rememberry
- ✅ Spaced repetition flashcards
- ✅ Custom decks, offline mode
- ❌ Manual — you have to add words yourself
- ❌ No immersion, no inline replacement
- ❌ Dated UI

### Readlang
- ✅ Click-to-translate on any page
- ✅ Flashcard creation from context
- ❌ Converts ENTIRE page — overwhelming for beginners
- ❌ No audio, no progressive learning

### Immersive Translate
- ✅ Beautiful bilingual page layout
- ✅ PDF/ebook support
- ❌ Translation tool, not a learning tool — no retention features
- ❌ Performance issues on video platforms

### What Everyone Misses
1. **Audio immersion** — Nobody does TTS pronunciation well inline
2. **Music/rhythm learning** — Zero extensions leverage music for memory
3. **Active recall on-page** — Nobody quizzes you *in context* on the page you're reading
4. **Beautiful UI** — Every extension looks like it was built in 2015
5. **Holistic system** — Nobody combines inline replacement + audio + SRS + quizzes + reading mode
6. **Smart difficulty** — Toucan tries but it's primitive; nobody uses true SRS algorithms

---

## 3. Core Features

### MVP (v1.0)

#### 3.1 Immersion Mode (Always On)
The heartbeat of Fluentify. When enabled, it scans any webpage and replaces a configurable percentage of words/phrases with the target language.

- **Smart Selection**: Uses word frequency lists + user's known vocabulary to pick words at the right difficulty (i+1)
- **Inline Replacement**: Words appear styled with a subtle underline/highlight that matches the page aesthetic
- **Hover to Reveal**: Hover over any replaced word to see the original + hear pronunciation
- **Click to Learn**: Click a word to mark it as "learning" — adds to SRS deck
- **Difficulty Slider**: 5%-50% of page content replaced (user controls intensity)
- **Domain Allowlist/Blocklist**: Enable on specific sites or disable on sensitive ones

#### 3.2 Word Bank & Spaced Repetition
- **Automatic Tracking**: Every word you hover/click is logged with context (the sentence it appeared in, the URL)
- **SM-2 Algorithm**: Modified SuperMemo algorithm for review scheduling
- **Word States**: New → Learning → Reviewing → Mastered → Archived
- **Context Cards**: Flashcards show the word in the original sentence context, not isolation
- **Stats Dashboard**: Words learned today/week/all-time, streak counter, level progression
- **Export**: Export your vocabulary as Anki deck or CSV

#### 3.3 Pronunciation Engine
- **Web Speech API TTS**: Click any replaced word to hear pronunciation
- **Auto-read mode**: Optionally auto-pronounce replaced words as you scroll past them (subtle, low volume)
- **Speed Control**: Slow/normal/fast pronunciation
- **Multiple Voices**: Use browser's available voices per language

#### 3.4 Quick Quiz (Micro-interactions)
- **Popup Quiz**: Gentle notification (bottom-right toast) every N minutes with a word from your SRS deck
- **Quiz Types**:
  - Multiple choice (target → native)
  - Type the translation
  - Listen and type (audio → text)
- **In-Page Quiz**: Occasionally, instead of showing the translated word, show a blank `____` and ask the user to recall
- **Non-intrusive**: Can be snoozed, frequency is configurable

#### 3.5 Popup Dashboard
Accessed by clicking the extension icon:
- Today's stats (words seen, learned, reviewed)
- Streak counter with visual flame
- Quick settings (intensity slider, pause, target language)
- "Start a Lesson" button → opens focused review session
- "Recite This Page" button → reads the page in target language

#### 3.6 Settings Page
Full options page (opens in new tab):
- Target language selection (support 20+ languages)
- Native language
- Proficiency level (Beginner A1 → Advanced C2)
- Immersion intensity (% of words replaced)
- Audio settings (auto-pronounce, voice selection, speed)
- Quiz frequency and types
- Domain allowlist/blocklist
- Data export/import
- Theme (dark/light/system)

### v2.0 Features

#### 3.7 Reading Mode
- **Full Page Translation**: Toggle to see the entire page in target language with bilingual paragraphs
- **Paragraph-by-paragraph**: Native on left, target on right (or interleaved)
- **Difficulty levels**: Simplified translation for beginners, literary for advanced

#### 3.8 Recite Mode (Page Audio)
- **Read Aloud**: TTS reads the entire page (or selection) in the target language
- **Karaoke Mode**: Highlights words as they're read, like subtitles
- **Speed Control**: 0.5x to 2x
- **Pause/Resume with spacebar**

#### 3.9 Music Mode 🎵
Inspired by Samyak's French teacher who played French songs:
- **Song Recommendations**: Based on target language, suggest popular songs with lyrics
- **Lyric Overlay**: When on YouTube/Spotify web, show translated lyrics alongside
- **Singalong Mode**: Highlight lyrics in time with music, show translations
- **Vocabulary from Songs**: Extract and add song vocabulary to SRS deck
- **Curated Playlists**: "French Pop for Beginners", "Spanish Rock Essentials", etc.

#### 3.10 Speaking Practice (STT)
- **Pronunciation Check**: User speaks a word/phrase, STT compares to expected
- **Shadowing Mode**: Extension reads a sentence, user repeats, get accuracy score
- **Conversation Snippets**: Short role-play scenarios in target language

#### 3.11 Grammar Hints
- **Contextual Grammar**: When hovering a replaced word, show grammatical notes (gender, conjugation, case)
- **Pattern Recognition**: "You've seen this verb conjugation 5 times — here's the pattern"

#### 3.12 Social & Gamification
- **Daily/Weekly Challenges**: "Learn 10 food words this week"
- **Achievements/Badges**: Streaks, milestones, language-specific achievements
- **Leaderboard** (optional): Compare with friends

---

## 4. Technical Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────┐
│                Chrome Extension              │
├──────────┬──────────┬───────────┬───────────┤
│ Content  │Background│  Popup    │ Options   │
│ Script   │ Worker   │  (React)  │ (React)   │
│          │ (SW)     │           │           │
├──────────┴──────────┴───────────┴───────────┤
│              Chrome Storage API              │
│         (sync + local + IndexedDB)           │
├─────────────────────────────────────────────┤
│          Free Translation APIs               │
│   (MyMemory / LibreTranslate / Lingva)      │
├─────────────────────────────────────────────┤
│          Web Speech API (TTS/STT)            │
└─────────────────────────────────────────────┘
```

### No Backend Required
The entire extension runs client-side:
- **Translation**: Free APIs (MyMemory: 5000 words/day free, Lingva: unlimited self-hostable, or browser built-in translation if available)
- **TTS**: Web Speech API (built into Chrome, free, 20+ languages)
- **STT**: Web Speech API SpeechRecognition (built into Chrome)
- **Storage**: Chrome Storage API (sync across devices) + IndexedDB (large vocabulary data)
- **Word Frequency Lists**: Bundled as static JSON files (~50KB per language)

### API Strategy (Zero Cost)
| Need | Solution | Limit |
|------|----------|-------|
| Translation | MyMemory API | 5,000 words/day free |
| Translation (backup) | Lingva Translate (open source) | Unlimited |
| TTS | Web Speech API | Unlimited, built-in |
| STT | Web Speech API SpeechRecognition | Unlimited, built-in |
| Word frequency | Bundled static data | N/A |
| Definitions | Wiktionary API | Unlimited |

---

## 5. UI/UX Design

### Design System
- **Framework**: Tailwind CSS
- **Colors**: True black dark mode (#0A0A0A base), with language-specific accent colors
  - French: Blue (#3B82F6)
  - Spanish: Orange (#F59E0B)
  - German: Red (#EF4444)
  - Japanese: Pink (#EC4899)
  - Default: Emerald (#10B981)
- **Typography**: Inter (UI), serif for replaced words to create visual distinction
- **Animations**: Framer Motion — subtle fade-ins, gentle bounces for quiz interactions
- **Border Radius**: 8px default, 12px for cards
- **Shadows**: Minimal — use layered surfaces instead

### Content Script Overlay
The inline replacements on webpages:
```
Original:  "The cat sat on the mat"
Fluentify: "The chat sat on the tapis"
               ^^^^                ^^^^^
           [styled with subtle dotted underline + slight color tint]
```

**Hover Card** (appears on hover over replaced word):
```
┌──────────────────────────┐
│  🇫🇷 chat                │
│  → cat                   │
│  /ʃa/ 🔊                │
│                          │
│  [+ Add to deck]  [Skip] │
└──────────────────────────┘
```
- Appears as a floating card near the word
- Glassmorphism effect (backdrop-blur)
- Respects page light/dark mode

### Popup (Extension Icon Click)
Compact, 360px × 480px:
```
┌──────────────────────────────┐
│  🔥 12-day streak      ⚙️    │
│                              │
│  ┌────────────────────────┐  │
│  │  Today                 │  │
│  │  📖 47 words seen      │  │
│  │  ✅ 12 words learned   │  │
│  │  🔄 8 reviews due      │  │
│  └────────────────────────┘  │
│                              │
│  ┌─ Intensity ────────────┐  │
│  │  ○○○●○  20%            │  │
│  └────────────────────────┘  │
│                              │
│  [📚 Start Lesson]           │
│  [🎙️ Recite Page]           │
│  [⏸️ Pause Fluentify]       │
│                              │
│  Learning: French 🇫🇷  ▼     │
└──────────────────────────────┘
```

### Settings Page
Full-page React app in new tab:
- Sidebar navigation (Language, Immersion, Audio, Quizzes, Data, About)
- Each section is clean cards with toggles and sliders
- Live preview of immersion settings
- Vocabulary browser with search/filter/sort

### Quiz Toast
Bottom-right corner of the page:
```
┌──────────────────────────────┐
│  What does "maison" mean?    │
│                              │
│  ○ car    ○ house            │
│  ○ book   ○ tree             │
│                              │
│  [Skip]          Fluentify 🧠│
└──────────────────────────────┘
```
- Slides in with animation
- Auto-dismisses after 30s if ignored
- Correct answer shows green flash + confetti particles (subtle)

---

## 6. Audio System

### Text-to-Speech (TTS)
**Primary**: Web Speech API `speechSynthesis`
- Available in all modern Chrome versions
- Supports 20+ languages natively
- Voice quality varies by OS (macOS has excellent voices)
- Configurable rate (0.5-2.0), pitch, volume

**Enhancement** (v2): Edge TTS integration via background worker
- Microsoft's neural voices (much higher quality)
- Free, no API key needed
- Would require a small proxy or service worker fetch

### Speech-to-Text (STT) — v2
**Primary**: Web Speech API `SpeechRecognition`
- Real-time transcription
- Good accuracy for major languages
- Used for pronunciation practice and shadowing

### Audio Features by Mode
| Mode | Audio | Implementation |
|------|-------|----------------|
| Hover pronunciation | Single word TTS | Web Speech API |
| Auto-read | Words TTS as you scroll | Intersection Observer + Web Speech API |
| Recite Page | Full page TTS | Web Speech API with sentence chunking |
| Music Mode | YouTube/Spotify integration | Content script overlay on player pages |
| Shadowing | TTS + STT comparison | Both Web Speech APIs |

---

## 7. Spaced Repetition System (SRS)

### Algorithm: Modified SM-2
Based on the SuperMemo SM-2 algorithm with modifications for passive learning:

```
For each word:
  - easeFactor (EF): starts at 2.5, min 1.3
  - interval: days until next review
  - repetition: number of consecutive correct recalls

On review:
  quality (0-5 scale based on response):
    5: Perfect, instant recall
    4: Correct, slight hesitation
    3: Correct, significant effort
    2: Incorrect, but felt familiar
    1: Incorrect, vaguely remembered
    0: Complete blackout

  if quality >= 3 (correct):
    if repetition == 0: interval = 1
    if repetition == 1: interval = 6
    else: interval = interval * EF
    repetition++
  else:
    repetition = 0
    interval = 1

  EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  EF = max(1.3, EF)
```

### Passive Learning Bonus
Words seen "in the wild" (on pages) get a review bonus:
- Seeing a word in context counts as a passive review (quality = 3)
- This naturally reinforces words without explicit quizzing
- Tracked via content script word detection

### Word Data Model
```typescript
interface Word {
  id: string;
  targetLang: string;        // "fr"
  word: string;              // "maison"
  translation: string;       // "house"
  pronunciation: string;     // "/mɛ.zɔ̃/"
  partOfSpeech: string;      // "noun"
  gender?: string;           // "feminine"
  
  // SRS fields
  easeFactor: number;        // 2.5 default
  interval: number;          // days
  repetition: number;        // consecutive correct
  nextReview: number;        // timestamp
  state: 'new' | 'learning' | 'reviewing' | 'mastered';
  
  // Context
  contexts: Array<{
    sentence: string;        // "La maison est grande"
    translation: string;     // "The house is big"
    url: string;             // where they encountered it
    timestamp: number;
  }>;
  
  // Stats
  timesEncountered: number;  // passive encounters on pages
  timesReviewed: number;     // active quiz reviews
  correctStreak: number;
  lastSeen: number;
}
```

### Storage Strategy
- **Chrome Storage Sync**: Settings, preferences, streak data (~100KB limit)
- **Chrome Storage Local**: Active vocabulary deck (~5MB limit)
- **IndexedDB**: Full word history, contexts, stats (unlimited)

---

## 8. Language Support

### Tier 1 (Launch)
Full support with word frequency lists, grammar hints, curated content:
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇯🇵 Japanese (with romaji)
- 🇰🇷 Korean (with romanization)
- 🇨🇳 Chinese Mandarin (with pinyin)

### Tier 2 (Post-launch)
Basic support (translation + TTS, no curated content):
- Dutch, Swedish, Norwegian, Danish, Finnish
- Russian, Polish, Czech, Turkish
- Arabic, Hindi, Thai, Vietnamese
- And more via MyMemory API (supports 80+ languages)

---

## 9. Monetization Strategy

### Freemium Model

#### Free Tier
- 3 target languages
- 20 words/day immersion limit
- Basic SRS (no context cards)
- TTS pronunciation
- Basic quiz mode
- 7-day streak tracking

#### Pro ($4.99/month or $39.99/year)
- Unlimited languages
- Unlimited daily words
- Full SRS with context cards
- All quiz modes
- Music Mode
- Recite Mode
- Speaking practice (STT)
- Reading Mode
- Export to Anki
- Advanced stats & analytics
- Priority support

#### Why This Works
- Free tier is genuinely useful (not crippled)
- Power users who learn daily will naturally want Pro
- Price is lower than Babbel ($7.99), Duolingo Plus ($6.99)
- No server costs = high margins

### Revenue Projections (Conservative)
- Chrome Web Store installs: 10K in year 1
- Free → Pro conversion: 5% = 500 paying users
- Average revenue per user: $40/year
- Year 1 revenue: ~$20,000
- Year 2 (50K installs, 7% conversion): ~$140,000

---

## 10. Chrome Web Store Publishing Plan

### Pre-Launch
1. **Landing page**: fluentify.app (simple, beautiful, one-page with demo video)
2. **Beta program**: 50 beta testers via ProductHunt upcoming, Reddit r/languagelearning
3. **Store listing assets**:
   - 5 screenshots (dark mode, showing key features)
   - 1 promotional video (60s, screen recording with narration)
   - Icon: Clean, modern — stylized "F" with a speech bubble
   - Description: SEO-optimized for "language learning extension", "learn French browsing"

### Launch Strategy
1. **Week 1**: Soft launch on Chrome Web Store
2. **Week 2**: Post on r/languagelearning, r/chrome, r/learnfrench etc.
3. **Week 3**: ProductHunt launch
4. **Week 4**: Hacker News Show HN

### Store Listing
- **Category**: Education
- **Keywords**: language learning, immersion, translate, vocabulary, spaced repetition, French, Spanish
- **Permissions** (minimal):
  - `activeTab` — to modify page content
  - `storage` — to save vocabulary and settings
  - `tts` — for pronunciation
  - No `<all_urls>` — use activeTab for privacy

### Privacy Policy
- **No data collection** — everything stays in Chrome Storage
- **No tracking** — no analytics in MVP (add privacy-respecting analytics later if needed)
- **No account required** — works immediately after install
- **Open source** (optional) — builds trust

---

## 11. Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Average words learned per day
- Streak length distribution
- Pages with Fluentify active per session

### Learning Outcomes
- Words progressing from "learning" to "mastered"
- Quiz accuracy over time
- Retention rate (% of words still known after 30 days)

### Business
- Install → Day 7 retention
- Free → Pro conversion rate
- Monthly Recurring Revenue (MRR)
- Chrome Web Store rating (target: 4.7+)

---

## 12. Roadmap

### Phase 1: MVP (Weeks 1-4)
- Immersion mode (inline word replacement)
- Hover cards with translation + pronunciation
- Basic SRS tracking
- Popup dashboard
- Settings page
- 3 languages (French, Spanish, German)

### Phase 2: Polish (Weeks 5-6)
- Quiz toasts
- Streak tracking
- Import/export
- Chrome Web Store submission
- Landing page

### Phase 3: Growth (Weeks 7-12)
- Reading mode
- Recite mode (page TTS)
- Music mode
- All Tier 1 languages
- Pro tier + payment (Stripe via landing page)

### Phase 4: Advanced (Months 4-6)
- Speaking practice (STT)
- Grammar hints
- Social features
- Mobile companion app (stretch goal)
