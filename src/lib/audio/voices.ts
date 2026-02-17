/**
 * Voice selection logic for TTS.
 * Prefers high-quality local voices, falls back to any available match.
 */

const voiceCache = new Map<string, SpeechSynthesisVoice>();

/** Get the best available voice for a language */
export function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (voiceCache.has(lang)) return voiceCache.get(lang)!;

  const voices = speechSynthesis.getVoices();
  const match = voices
    .filter((v) => v.lang.startsWith(lang))
    .sort((a, b) => {
      // Prefer local (offline) voices — faster
      if (a.localService && !b.localService) return -1;
      if (!a.localService && b.localService) return 1;
      // Prefer "Enhanced" / "Premium" / "Neural" voices
      const aEnhanced = /enhanced|premium|neural/i.test(a.name);
      const bEnhanced = /enhanced|premium|neural/i.test(b.name);
      if (aEnhanced && !bEnhanced) return -1;
      if (!aEnhanced && bEnhanced) return 1;
      return 0;
    })[0] ?? null;

  if (match) voiceCache.set(lang, match);
  return match;
}

/** Get all available voices for a language */
export function getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices().filter((v) => v.lang.startsWith(lang));
}

/** Clear the voice cache (call when voices change) */
export function clearVoiceCache(): void {
  voiceCache.clear();
}
