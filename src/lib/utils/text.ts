/**
 * Tokenizes text into words, preserving their positions for reconstruction.
 * Handles punctuation, whitespace, and common edge cases.
 */
export interface Token {
  /** The raw text of this token */
  text: string;
  /** Whether this token is a word (vs punctuation/whitespace) */
  isWord: boolean;
  /** Start index in the original string */
  start: number;
  /** End index in the original string */
  end: number;
}

/** Split text into word and non-word tokens */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Match sequences of word characters (including accented) or non-word sequences
  const regex = /[\p{L}\p{N}]+(?:['']\p{L}+)?|[^\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const isWord = /[\p{L}]/u.test(match[0]);
    tokens.push({
      text: match[0],
      isWord,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
}

/**
 * Normalize a word for lookup: lowercase, trim.
 * Preserves accented characters (important for French, etc.)
 */
export function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}
