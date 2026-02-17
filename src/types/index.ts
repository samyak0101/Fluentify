/** Core word type used throughout the app */
export interface Word {
  id: string;
  targetLang: string;
  word: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: string;
  gender?: string;

  // SRS fields
  easeFactor: number;
  interval: number;
  repetition: number;
  nextReview: number;
  state: 'new' | 'learning' | 'reviewing' | 'mastered';

  // Context
  contexts: WordContext[];

  // Stats
  timesEncountered: number;
  timesReviewed: number;
  correctStreak: number;
  lastSeen: number;
}

export interface WordContext {
  sentence: string;
  translation: string;
  url: string;
  timestamp: number;
}

/** Frequency list entry (compact format for bundled JSON) */
export interface FrequencyEntry {
  /** word */
  w: string;
  /** frequency rank */
  r: number;
  /** translation */
  t: string;
  /** part of speech */
  p: string;
  /** gender (optional) */
  g?: string;
}

export interface FrequencyList {
  words: FrequencyEntry[];
}

export interface DailyStats {
  date: string;
  wordsSeen: number;
  wordsLearned: number;
  reviewsDue: number;
  reviewsCompleted: number;
  quizCorrect: number;
  quizTotal: number;
  streak: number;
}

export interface TranslationResult {
  word: string;
  translation: string;
  source: 'mymemory' | 'lingva' | 'cache' | 'frequency' | 'failed';
  pronunciation?: string;
  partOfSpeech?: string;
}
