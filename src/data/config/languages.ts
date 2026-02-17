export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  accentColor: string;
  /** BCP 47 tag for TTS */
  ttsLang: string;
  /** Uses Latin alphabet */
  isLatin: boolean;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    accentColor: '#3B82F6',
    ttsLang: 'fr-FR',
    isLatin: true,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    accentColor: '#F59E0B',
    ttsLang: 'es-ES',
    isLatin: true,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    accentColor: '#EF4444',
    ttsLang: 'de-DE',
    isLatin: true,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    accentColor: '#22C55E',
    ttsLang: 'it-IT',
    isLatin: true,
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    accentColor: '#06B6D4',
    ttsLang: 'pt-PT',
    isLatin: true,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    accentColor: '#EC4899',
    ttsLang: 'ja-JP',
    isLatin: false,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    accentColor: '#8B5CF6',
    ttsLang: 'ko-KR',
    isLatin: false,
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    accentColor: '#DC2626',
    ttsLang: 'zh-CN',
    isLatin: false,
  },
};
