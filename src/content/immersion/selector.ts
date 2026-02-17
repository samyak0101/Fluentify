import { frequencyManager } from '@/lib/words/frequency';
import { normalizeWord } from '@/lib/utils/text';

export interface WordSelection {
  /** The original English word that will be replaced */
  original: string;
  /** The target language translation */
  translation: string;
  /** Pronunciation hint (if available) */
  pronunciation?: string;
  /** Part of speech */
  partOfSpeech?: string;
  /** Gender (for gendered languages) */
  gender?: string;
}

/**
 * Given a list of English words found on the page, select which ones to
 * replace with target language equivalents. Uses frequency lists + i+1 principle.
 *
 * @param words - Array of English words from the page
 * @param intensity - 0.05 to 0.50 — fraction of words to replace
 * @param knownWords - Words the user already knows (mastered)
 * @param learningWords - Words currently being learned (prioritized)
 */
export function selectWordsForReplacement(
  words: string[],
  intensity: number,
  knownWords: Set<string> = new Set(),
  learningWords: Set<string> = new Set(),
): Map<string, WordSelection> {
  const selections = new Map<string, WordSelection>();
  const seen = new Set<string>();

  // Deduplicate and filter candidates
  const candidates: Array<{ word: string; normalized: string; score: number }> = [];

  for (const word of words) {
    const normalized = normalizeWord(word);

    // Skip: too short, already seen, numbers, or already-known (mostly)
    if (normalized.length < 3) continue;
    if (seen.has(normalized)) continue;
    if (/^\d+$/.test(normalized)) continue;

    seen.add(normalized);

    // Check if we have a translation in our frequency list
    // We match English words to their French equivalents
    const entry = findTranslationForEnglishWord(normalized);
    if (!entry) continue;

    // Skip known words (but show 10% for reinforcement)
    if (knownWords.has(normalized) && Math.random() > 0.1) continue;

    // Score: learning words get highest priority, then by frequency rank
    const score = learningWords.has(normalized)
      ? 1000
      : entry.rank > 0
        ? 500 - entry.rank // Higher frequency = higher score
        : 0;

    candidates.push({ word, normalized, score });
  }

  // Sort by score descending (most useful words first)
  candidates.sort((a, b) => b.score - a.score);

  // Select top N% based on intensity
  const targetCount = Math.max(1, Math.ceil(candidates.length * intensity));
  const selected = candidates.slice(0, targetCount);

  for (const { word, normalized } of selected) {
    const entry = findTranslationForEnglishWord(normalized);
    if (!entry) continue;

    selections.set(word.toLowerCase(), {
      original: word,
      translation: entry.translation,
      pronunciation: entry.pronunciation,
      partOfSpeech: entry.partOfSpeech,
      gender: entry.gender,
    });
  }

  return selections;
}

/**
 * Reverse-lookup: find a French word whose translation matches an English word.
 * This is the core of the immersion engine — we replace English words with
 * their French equivalents.
 */
function findTranslationForEnglishWord(
  englishWord: string,
): {
  translation: string;
  rank: number;
  pronunciation?: string;
  partOfSpeech?: string;
  gender?: string;
} | null {
  const normalized = englishWord.toLowerCase();

  // Build reverse map on first call (cached)
  const reverseMap = getReverseMap();
  return reverseMap.get(normalized) ?? null;
}

let _reverseMap: Map<
  string,
  {
    translation: string;
    rank: number;
    pronunciation?: string;
    partOfSpeech?: string;
    gender?: string;
  }
> | null = null;

/**
 * Builds and caches a reverse map: english translation → french word info.
 * For entries with multiple translations (e.g. "of/from"), index each part.
 */
function getReverseMap() {
  if (_reverseMap) return _reverseMap;
  _reverseMap = new Map();

  for (const entry of frequencyManager.entries()) {
    // Split translation on "/" to handle multi-translations like "of/from"
    const translations = entry.t.split('/').map((t) => t.trim().toLowerCase());
    for (const t of translations) {
      // Only store the highest-frequency (lowest rank) match
      const existing = _reverseMap.get(t);
      if (!existing || entry.r < existing.rank) {
        _reverseMap.set(t, {
          translation: entry.w,
          rank: entry.r,
          partOfSpeech: entry.p,
          gender: entry.g,
        });
      }
    }
  }

  return _reverseMap;
}

/** Clear the reverse map cache (call when language changes) */
export function clearSelectionCache(): void {
  _reverseMap = null;
}
