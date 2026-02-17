/**
 * IndexedDB wrapper for vocabulary storage and translation cache.
 * Uses the `idb` library for a Promise-based API.
 */

import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { Word } from '@/types';

interface FluentifyDB extends DBSchema {
  vocabulary: {
    key: string;
    value: Word;
    indexes: {
      'by-state': string;
      'by-next-review': number;
      'by-lang': string;
    };
  };
  translations: {
    key: string; // `${word}:${targetLang}`
    value: {
      key: string;
      word: string;
      targetLang: string;
      translation: string;
      pronunciation?: string;
      partOfSpeech?: string;
      cachedAt: number;
    };
    indexes: {
      'by-lang': string;
    };
  };
  encounters: {
    key: number;
    value: {
      id?: number;
      wordId: string;
      url: string;
      sentence: string;
      timestamp: number;
    };
  };
}

const DB_NAME = 'fluentify';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FluentifyDB> | null = null;

/** Get or create the database connection */
export async function getDB(): Promise<IDBPDatabase<FluentifyDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FluentifyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Vocabulary store
      if (!db.objectStoreNames.contains('vocabulary')) {
        const vocabStore = db.createObjectStore('vocabulary', {
          keyPath: 'id',
        });
        vocabStore.createIndex('by-state', 'state');
        vocabStore.createIndex('by-next-review', 'nextReview');
        vocabStore.createIndex('by-lang', 'targetLang');
      }

      // Translations cache
      if (!db.objectStoreNames.contains('translations')) {
        const txStore = db.createObjectStore('translations', {
          keyPath: 'key',
        });
        txStore.createIndex('by-lang', 'targetLang');
      }

      // Encounter log
      if (!db.objectStoreNames.contains('encounters')) {
        db.createObjectStore('encounters', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });

  return dbInstance;
}

// ─── Vocabulary Operations ───────────────────────────────────────────

/** Add or update a word in the vocabulary */
export async function saveWord(word: Word): Promise<void> {
  const db = await getDB();
  await db.put('vocabulary', word);
}

/** Get a word by ID */
export async function getWord(id: string): Promise<Word | undefined> {
  const db = await getDB();
  return db.get('vocabulary', id);
}

/** Get all words in a specific state */
export async function getWordsByState(
  state: Word['state'],
): Promise<Word[]> {
  const db = await getDB();
  return db.getAllFromIndex('vocabulary', 'by-state', state);
}

/** Get all words for a language */
export async function getWordsByLang(lang: string): Promise<Word[]> {
  const db = await getDB();
  return db.getAllFromIndex('vocabulary', 'by-lang', lang);
}

/** Get words due for review (nextReview <= now) */
export async function getDueWords(): Promise<Word[]> {
  const db = await getDB();
  const now = Date.now();
  const range = IDBKeyRange.upperBound(now);
  return db.getAllFromIndex('vocabulary', 'by-next-review', range);
}

/** Get count of words due for review */
export async function getDueCount(): Promise<number> {
  const db = await getDB();
  const now = Date.now();
  const range = IDBKeyRange.upperBound(now);
  return db.countFromIndex('vocabulary', 'by-next-review', range);
}

/** Get total vocabulary count */
export async function getVocabCount(): Promise<number> {
  const db = await getDB();
  return db.count('vocabulary');
}

/** Get all vocabulary */
export async function getAllWords(): Promise<Word[]> {
  const db = await getDB();
  return db.getAll('vocabulary');
}

/** Delete a word */
export async function deleteWord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('vocabulary', id);
}

// ─── Translation Cache ───────────────────────────────────────────────

/** Cache a translation */
export async function cacheTranslation(
  word: string,
  targetLang: string,
  translation: string,
  pronunciation?: string,
  partOfSpeech?: string,
): Promise<void> {
  const db = await getDB();
  const key = `${word.toLowerCase()}:${targetLang}`;
  await db.put('translations', {
    key,
    word: word.toLowerCase(),
    targetLang,
    translation,
    pronunciation,
    partOfSpeech,
    cachedAt: Date.now(),
  });
}

/** Look up a cached translation */
export async function getCachedTranslation(
  word: string,
  targetLang: string,
): Promise<{ translation: string; pronunciation?: string } | undefined> {
  const db = await getDB();
  const key = `${word.toLowerCase()}:${targetLang}`;
  const result = await db.get('translations', key);
  if (!result) return undefined;
  return { translation: result.translation, pronunciation: result.pronunciation };
}

// ─── Encounters ──────────────────────────────────────────────────────

/** Log a word encounter (seen on a page) */
export async function logEncounter(
  wordId: string,
  url: string,
  sentence: string,
): Promise<void> {
  const db = await getDB();
  await db.add('encounters', {
    wordId,
    url,
    sentence,
    timestamp: Date.now(),
  });
}
