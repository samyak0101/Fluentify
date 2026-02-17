/**
 * Text-to-Speech wrapper using Web Speech API.
 * Provides a simple async interface for speaking words/phrases.
 */

import { getBestVoice } from './voices';

export interface TTSOptions {
  rate?: number;    // 0.5 - 2.0 (default: 0.9)
  volume?: number;  // 0 - 1 (default: 0.8)
  voiceURI?: string; // Specific voice to use
}

/**
 * Speak a word or phrase in the given language.
 * Cancels any in-progress speech first.
 * Returns a promise that resolves when speech finishes.
 */
export function speak(
  text: string,
  lang: string,
  options: TTSOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cancel ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = options.rate ?? 0.9;
    utterance.volume = options.volume ?? 0.8;

    // Select voice
    if (options.voiceURI) {
      const voices = speechSynthesis.getVoices();
      const match = voices.find((v) => v.voiceURI === options.voiceURI);
      if (match) utterance.voice = match;
    } else {
      const voice = getBestVoice(lang);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // Don't reject on "interrupted" — that's expected when we cancel
      if (e.error === 'interrupted') {
        resolve();
      } else {
        reject(new Error(`TTS error: ${e.error}`));
      }
    };

    speechSynthesis.speak(utterance);
  });
}

/** Stop any in-progress speech */
export function stopSpeaking(): void {
  speechSynthesis.cancel();
}

/** Check if TTS is currently speaking */
export function isSpeaking(): boolean {
  return speechSynthesis.speaking;
}
