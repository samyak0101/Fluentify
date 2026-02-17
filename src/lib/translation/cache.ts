/**
 * Translation cache layer — checks IndexedDB before hitting external APIs.
 * Ensures we never translate the same word twice.
 */

import { getCachedTranslation, cacheTranslation } from '@/lib/storage/idb';

export class TranslationCache {
  /** Look up a cached translation */
  static async get(
    word: string,
    targetLang: string,
  ): Promise<{ translation: string; pronunciation?: string } | undefined> {
    return getCachedTranslation(word, targetLang);
  }

  /** Store a translation in the cache */
  static async set(
    word: string,
    targetLang: string,
    translation: string,
    pronunciation?: string,
    partOfSpeech?: string,
  ): Promise<void> {
    await cacheTranslation(word, targetLang, translation, pronunciation, partOfSpeech);
  }
}
