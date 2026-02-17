export interface TranslationResult {
  word: string;
  translation: string;
  source: 'mymemory' | 'lingva' | 'cache' | 'frequency' | 'failed';
  pronunciation?: string;
  partOfSpeech?: string;
}
