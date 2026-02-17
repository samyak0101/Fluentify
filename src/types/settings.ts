export interface Settings {
  targetLanguage: string;
  nativeLanguage: string;
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  immersionEnabled: boolean;
  immersionIntensity: number;
  replaceMode: 'words' | 'phrases' | 'sentences';

  autoPronounce: boolean;
  ttsRate: number;
  ttsVolume: number;
  preferredVoice?: string;

  quizEnabled: boolean;
  quizFrequencyMinutes: number;
  quizTypes: ('multipleChoice' | 'typeAnswer' | 'listenType')[];

  theme: 'dark' | 'light' | 'system';
  highlightStyle: 'underline' | 'background' | 'italic';
  showPronunciation: boolean;

  enabledDomains: string[];
  disabledDomains: string[];
  syncEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  targetLanguage: 'fr',
  nativeLanguage: 'en',
  proficiencyLevel: 'A1',
  immersionEnabled: true,
  immersionIntensity: 0.15,
  replaceMode: 'words',
  autoPronounce: false,
  ttsRate: 0.9,
  ttsVolume: 0.8,
  quizEnabled: true,
  quizFrequencyMinutes: 15,
  quizTypes: ['multipleChoice'],
  theme: 'dark',
  highlightStyle: 'underline',
  showPronunciation: true,
  enabledDomains: [],
  disabledDomains: ['mail.google.com', 'docs.google.com', 'github.com'],
  syncEnabled: true,
};
