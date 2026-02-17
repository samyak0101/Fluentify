/**
 * Translation API — unified interface with caching and fallback.
 * 1. Check IndexedDB cache
 * 2. Try MyMemory API
 * 3. Fallback to Lingva
 * 4. Cache all successful results
 */

import type { TranslationResult } from './types';
import { TranslationCache } from './cache';
import { translateMyMemory } from './mymemory';
import { translateLingva } from './lingva';

/**
 * Translate a batch of words with caching and rate-limit awareness.
 * Returns a Map of original word → TranslationResult.
 */
export async function translateBatch(
  words: string[],
  sourceLang: string,
  targetLang: string,
): Promise<Map<string, TranslationResult>> {
  const results = new Map<string, TranslationResult>();
  const uncached: string[] = [];

  // 1. Check cache first
  for (const word of words) {
    const cached = await TranslationCache.get(word, targetLang);
    if (cached) {
      results.set(word, {
        word,
        translation: cached.translation,
        pronunciation: cached.pronunciation,
        source: 'cache',
      });
    } else {
      uncached.push(word);
    }
  }

  if (uncached.length === 0) return results;

  // 2. Translate uncached words in small batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map((word) => translateSingleWord(word, sourceLang, targetLang)),
    );

    for (let j = 0; j < batch.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.set(batch[j], result.value);
        // Cache the result
        await TranslationCache.set(
          batch[j],
          targetLang,
          result.value.translation,
          result.value.pronunciation,
          result.value.partOfSpeech,
        );
      } else {
        results.set(batch[j], {
          word: batch[j],
          translation: batch[j], // Fallback to original
          source: 'failed',
        });
      }
    }

    // Rate limit: 100ms between batches
    if (i + BATCH_SIZE < uncached.length) {
      await sleep(100);
    }
  }

  return results;
}

/**
 * Translate a single word with fallback.
 */
async function translateSingleWord(
  word: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  // Try MyMemory first
  try {
    const translation = await translateMyMemory(word, sourceLang, targetLang);
    return { word, translation, source: 'mymemory' };
  } catch {
    // MyMemory failed — try Lingva
  }

  try {
    const translation = await translateLingva(word, sourceLang, targetLang);
    return { word, translation, source: 'lingva' };
  } catch {
    // Both failed
  }

  throw new Error(`All translation providers failed for: ${word}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
