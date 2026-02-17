/**
 * SRS Scheduler — coordinates review scheduling with IndexedDB storage.
 */

import type { Word } from '@/types';
import type { ReviewQuality } from './types';
import { calculateNextReview, createSRSWord, applyPassiveEncounter } from './sm2';
import { getWord, saveWord, getDueWords, getDueCount, getWordsByLang } from '@/lib/storage/idb';

export class SRSScheduler {
  /**
   * Add a new word to the SRS deck.
   * If it already exists, add the context and bump encounter count.
   */
  static async addWord(
    targetLang: string,
    wordText: string,
    translation: string,
    context?: { sentence: string; url: string },
    extra?: {
      pronunciation?: string;
      partOfSpeech?: string;
      gender?: string;
    },
  ): Promise<Word> {
    const id = `${targetLang}:${wordText.toLowerCase()}`;
    const existing = await getWord(id);

    if (existing) {
      // Word already tracked — add context and bump encounters
      const updates = applyPassiveEncounter(existing);
      const updated: Word = {
        ...existing,
        ...updates,
      };
      if (context && !existing.contexts.some((c) => c.sentence === context.sentence)) {
        updated.contexts = [
          ...existing.contexts,
          {
            sentence: context.sentence,
            translation: '',
            url: context.url,
            timestamp: Date.now(),
          },
        ].slice(-10); // Keep last 10 contexts
      }
      await saveWord(updated);
      return updated;
    }

    // New word
    const word = createSRSWord(id, targetLang, wordText, translation, context, extra);
    await saveWord(word);
    return word;
  }

  /**
   * Submit a review result and update the word's SRS schedule.
   */
  static async submitReview(wordId: string, quality: ReviewQuality): Promise<Word | null> {
    const word = await getWord(wordId);
    if (!word) return null;

    const updates = calculateNextReview(word, quality);
    const updated: Word = { ...word, ...updates };
    await saveWord(updated);
    return updated;
  }

  /**
   * Record a passive encounter (word seen on a page).
   */
  static async recordEncounter(wordId: string): Promise<void> {
    const word = await getWord(wordId);
    if (!word) return;

    const updates = applyPassiveEncounter(word);
    await saveWord({ ...word, ...updates });
  }

  /** Get all words due for review */
  static async getDueReviews(): Promise<Word[]> {
    return getDueWords();
  }

  /** Get count of due reviews */
  static async getDueCount(): Promise<number> {
    return getDueCount();
  }

  /** Get all known (mastered) words for a language */
  static async getKnownWords(lang: string): Promise<Set<string>> {
    const words = await getWordsByLang(lang);
    const known = new Set<string>();
    for (const w of words) {
      if (w.state === 'mastered') {
        known.add(w.word.toLowerCase());
      }
    }
    return known;
  }

  /** Get all learning words for a language */
  static async getLearningWords(lang: string): Promise<Set<string>> {
    const words = await getWordsByLang(lang);
    const learning = new Set<string>();
    for (const w of words) {
      if (w.state === 'learning' || w.state === 'reviewing') {
        learning.add(w.word.toLowerCase());
      }
    }
    return learning;
  }
}
