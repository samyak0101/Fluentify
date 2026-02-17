import type { Settings } from './settings';

export type Message =
  | { type: 'TRANSLATE_WORDS'; words: string[]; targetLang: string; sourceLang: string }
  | { type: 'ADD_WORD'; wordId: string; word: string; translation: string; context?: string; url?: string }
  | { type: 'RECORD_ENCOUNTER'; wordId: string; url: string; sentence: string }
  | { type: 'GET_DUE_REVIEWS' }
  | { type: 'SUBMIT_REVIEW'; wordId: string; quality: 0 | 1 | 2 | 3 | 4 | 5 }
  | { type: 'GET_SETTINGS' }
  | { type: 'SETTINGS_UPDATED'; settings: Settings }
  | { type: 'GET_STATS' }
  | { type: 'GET_KNOWN_WORDS'; lang: string }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };
