/**
 * Lingva Translate API adapter (fallback).
 * Open-source Google Translate frontend.
 * Public instance: lingva.ml (may have rate limits).
 */

const BASE_URL = 'https://lingva.ml/api/v1';

interface LingvaResponse {
  translation: string;
}

/**
 * Translate using Lingva (fallback when MyMemory is unavailable).
 */
export async function translateLingva(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const encodedText = encodeURIComponent(text);
  const url = `${BASE_URL}/${sourceLang}/${targetLang}/${encodedText}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Lingva HTTP error: ${response.status}`);
  }

  const data: LingvaResponse = await response.json();
  return data.translation;
}
