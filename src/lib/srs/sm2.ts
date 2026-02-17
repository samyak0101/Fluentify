/**
 * SM-2 Spaced Repetition Algorithm.
 * Based on SuperMemo 2, modified for passive learning context.
 *
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import type { Word } from '@/types';
import type { ReviewQuality } from './types';

/** Default values for a new word entering the SRS */
export const SRS_DEFAULTS = {
  easeFactor: 2.5,
  interval: 0,
  repetition: 0,
  nextReview: Date.now(),
  state: 'new' as const,
  timesEncountered: 0,
  timesReviewed: 0,
  correctStreak: 0,
  lastSeen: Date.now(),
};

/**
 * Calculate the next review schedule based on the user's response quality.
 * Returns a partial Word with updated SRS fields.
 */
export function calculateNextReview(
  word: Pick<Word, 'easeFactor' | 'interval' | 'repetition' | 'timesReviewed' | 'correctStreak'>,
  quality: ReviewQuality,
): {
  easeFactor: number;
  interval: number;
  repetition: number;
  nextReview: number;
  state: Word['state'];
  timesReviewed: number;
  correctStreak: number;
} {
  let { easeFactor, interval, repetition } = word;

  if (quality >= 3) {
    // Correct response
    switch (repetition) {
      case 0:
        interval = 1;
        break;
      case 1:
        interval = 6;
        break;
      default:
        interval = Math.round(interval * easeFactor);
        break;
    }
    repetition++;
  } else {
    // Incorrect — reset
    repetition = 0;
    interval = 1;
  }

  // Update ease factor (never below 1.3)
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  // Determine state
  let state: Word['state'];
  if (repetition === 0) {
    state = 'learning';
  } else if (interval < 21) {
    state = 'reviewing';
  } else {
    state = 'mastered';
  }

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

/**
 * Apply a passive encounter bonus.
 * Seeing a word "in the wild" counts as a soft review (quality = 3).
 * This only applies if the word is in the learning/reviewing state.
 */
export function applyPassiveEncounter(
  word: Pick<Word, 'state' | 'timesEncountered' | 'lastSeen'>,
): {
  timesEncountered: number;
  lastSeen: number;
} {
  return {
    timesEncountered: word.timesEncountered + 1,
    lastSeen: Date.now(),
  };
}

/**
 * Create a new Word object for the SRS system.
 */
export function createSRSWord(
  id: string,
  targetLang: string,
  wordText: string,
  translation: string,
  context?: { sentence: string; url: string },
  extra?: {
    pronunciation?: string;
    partOfSpeech?: string;
    gender?: string;
  },
): Word {
  return {
    id,
    targetLang,
    word: wordText,
    translation,
    pronunciation: extra?.pronunciation,
    partOfSpeech: extra?.partOfSpeech,
    gender: extra?.gender,
    ...SRS_DEFAULTS,
    state: 'learning',
    contexts: context
      ? [
          {
            sentence: context.sentence,
            translation: '',
            url: context.url,
            timestamp: Date.now(),
          },
        ]
      : [],
  };
}
