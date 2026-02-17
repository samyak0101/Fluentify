/**
 * MyMemory Translation API adapter.
 * Free tier: 5,000 words/day, no API key required.
 * https://mymemory.translated.net/doc/spec.php
 */

const BASE_URL = 'https://api.mymemory.translated.net/get';

interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
    match: number;
  };
  matches?: Array<{
    translation: string;
    quality: number;
    match: number;
  }>;
}

/**
 * Translate a single word or short phrase using MyMemory.
 * @throws Error if the API returns a non-200 status
 */
export async function translateMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
  });

  const response = await fetch(`${BASE_URL}?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`MyMemory HTTP error: ${response.status}`);
  }

  const data: MyMemoryResponse = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory API error: status ${data.responseStatus}`);
  }

  return data.responseData.translatedText;
}
