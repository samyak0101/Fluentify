import type { FrequencyEntry, FrequencyList } from '@/types';

/**
 * Manages frequency list data for the active language.
 * Provides fast lookups for word selection.
 */
export class FrequencyManager {
  /** word → FrequencyEntry */
  private map = new Map<string, FrequencyEntry>();
  private loaded = false;

  /** Load a frequency list (from bundled JSON) */
  load(data: FrequencyList): void {
    this.map.clear();
    for (const entry of data.words) {
      this.map.set(entry.w.toLowerCase(), entry);
    }
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  /** Look up a word; returns undefined if not in the frequency list */
  get(word: string): FrequencyEntry | undefined {
    return this.map.get(word.toLowerCase());
  }

  /** Check if a word is in the frequency list */
  has(word: string): boolean {
    return this.map.has(word.toLowerCase());
  }

  /** Get the frequency rank (lower = more common). Returns Infinity if unknown. */
  rank(word: string): number {
    return this.map.get(word.toLowerCase())?.r ?? Infinity;
  }

  /** Get the bundled translation for a word */
  translation(word: string): string | undefined {
    return this.map.get(word.toLowerCase())?.t;
  }

  /** Get all entries as an array */
  entries(): FrequencyEntry[] {
    return Array.from(this.map.values());
  }

  /** How many words are loaded */
  get size(): number {
    return this.map.size;
  }
}

/** Singleton instance */
export const frequencyManager = new FrequencyManager();
