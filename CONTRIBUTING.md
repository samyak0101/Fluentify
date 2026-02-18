# Contributing to Fluentify

Thanks for your interest in contributing! Fluentify is a small project with a big goal — making language learning invisible and habitual. Every contribution helps.

---

## Table of Contents
- [Getting Started](#getting-started)
- [Ways to Contribute](#ways-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Submitting a PR](#submitting-a-pr)
- [Adding a Language](#adding-a-language)

---

## Getting Started

```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/fluentify.git
cd fluentify
npm install
npm run build
```

Load `dist/` in Chrome:
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select `dist/`

For live development with hot reload:
```bash
npm run dev
```
Then reload the extension in Chrome after each change.

---

## Ways to Contribute

### 🌍 Add a Language Frequency List
This is the single highest-impact thing you can do. Each language needs a JSON file at `public/data/frequencies/<lang>.json` with the top 500–1000 most common words.

See [Adding a Language](#adding-a-language) below.

### 🐛 Fix a Bug
Check [open issues](https://github.com/samyak0101/fluentify/issues) labeled `bug`. Good ones to start with are labeled `good first issue`.

### ✨ Implement a Feature
Features labeled `help wanted` in issues are fair game. Comment first so we don't duplicate work.

### 📖 Improve Docs
README, inline comments, JSDoc — all welcome.

### 🧪 Write Tests
We use Vitest. Coverage is low right now. Tests for `lib/srs/sm2.ts`, `lib/utils/text.ts`, and `lib/translation/api.ts` would be great.

---

## Development Workflow

### Project Structure
```
src/
├── background/     # Service worker — handles alarms, message routing
├── content/        # Content script — runs on every page
│   ├── immersion/  # DOM scanning, word selection, replacement
│   └── overlay/    # Shadow DOM components (HoverCard, QuizToast)
├── popup/          # Extension popup (React)
├── options/        # Settings page (React)
├── lib/            # Shared: SRS, translation, audio, storage, utils
├── data/           # Language configs, frequency lists
└── types/          # TypeScript types
```

### Key Rules
- **TypeScript strict mode** — no `any` unless absolutely necessary
- **No backend** — everything client-side
- **Performance first** — content scripts must not slow down pages
- **Accessibility** — all interactive elements need ARIA labels
- **Dark mode first** — UI components use the design tokens in `tailwind.config.ts`

### Running Tests
```bash
npm test               # run all tests
npm run test:coverage  # with coverage report
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

---

## Code Style

- **Formatting**: Prettier (runs on commit)
- **Imports**: Use `@/` alias for `src/` (e.g., `import { sm2 } from '@/lib/srs/sm2'`)
- **Components**: PascalCase files (`HoverCard.tsx`)
- **Utilities**: camelCase files (`scanner.ts`)
- **Comments**: JSDoc for exported functions, inline for complex logic
- **Error handling**: Every `async` function must have try/catch — never let errors bubble silently to users

---

## Submitting a PR

1. **Branch** from `main`: `git checkout -b your-feature-name`
2. **Make your changes** — one logical change per PR
3. **Test** — load the extension in Chrome and verify it works
4. **Run checks**: `npm run typecheck && npm run lint && npm test`
5. **Commit** with a clear message: `feat: add Portuguese frequency list` / `fix: hover card position on RTL pages`
6. **Open a PR** with a description of what you changed and why

**PR checklist:**
- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] No new `any` types introduced
- [ ] New features have at least a basic test
- [ ] README updated if applicable

---

## Adding a Language

Language frequency lists are JSON files at `public/data/frequencies/<iso-code>.json`.

### Format
```json
{
  "lang": "fr",
  "words": [
    { "w": "maison", "r": 45, "t": "house", "p": "n", "g": "f" },
    { "w": "parler", "r": 67, "t": "to speak", "p": "v" },
    { "w": "grand",  "r": 89, "t": "big/large", "p": "adj", "g": "m" }
  ]
}
```

Fields:
| Field | Required | Description |
|-------|----------|-------------|
| `w` | ✅ | Word in target language |
| `r` | ✅ | Frequency rank (lower = more common) |
| `t` | ✅ | English translation |
| `p` | ✅ | Part of speech: `n`, `v`, `adj`, `adv`, `prep`, `conj`, `art`, `pron` |
| `g` | ❌ | Gender: `m` or `f` (for languages with grammatical gender) |

### Steps
1. Find a quality word frequency list for your language (Wiktionary frequency lists are great sources)
2. Create `public/data/frequencies/<iso-code>.json` following the format above
3. Add the language to `src/data/config/languages.ts`:
   ```typescript
   {
     code: 'pt',
     name: 'Portuguese',
     flag: '🇵🇹',
     ttsLang: 'pt-PT',
     accent: '#10B981',
   }
   ```
4. Test it by selecting that language in the popup and visiting an English webpage
5. Submit a PR!

### ISO Language Codes
Use the ISO 639-1 two-letter codes: `fr`, `es`, `de`, `it`, `pt`, `ja`, `ko`, `zh`, `ru`, `ar`, etc.

---

## Questions?

Open a [GitHub Discussion](https://github.com/samyak0101/fluentify/discussions) or file an [issue](https://github.com/samyak0101/fluentify/issues).
