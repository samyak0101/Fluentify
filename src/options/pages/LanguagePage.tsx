import type { Settings } from '@/types/settings';
import { LANGUAGES } from '@/data/config/languages';

interface Props {
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
}

const LEVELS = [
  { value: 'A1', label: 'A1 — Beginner', desc: 'Just starting out' },
  { value: 'A2', label: 'A2 — Elementary', desc: 'Basic phrases and vocab' },
  { value: 'B1', label: 'B1 — Intermediate', desc: 'Can handle everyday situations' },
  { value: 'B2', label: 'B2 — Upper Intermediate', desc: 'Comfortable conversations' },
  { value: 'C1', label: 'C1 — Advanced', desc: 'Fluent in most contexts' },
  { value: 'C2', label: 'C2 — Mastery', desc: 'Near-native proficiency' },
] as const;

export function LanguagePage({ settings, onChange }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Language Settings</h2>

      {/* Target language */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <h3 className="text-sm font-medium text-white/70 mb-4">I'm learning</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onChange({ targetLanguage: lang.code })}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                settings.targetLanguage === lang.code
                  ? 'bg-accent/10 ring-1 ring-accent/40'
                  : 'bg-surface-3 hover:bg-surface-4'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <div className="text-sm font-medium text-white/90">{lang.name}</div>
                <div className="text-xs text-white/40">{lang.nativeName}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Proficiency level */}
      <section className="bg-surface-2 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white/70 mb-4">My level</h3>
        <div className="space-y-2">
          {LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange({ proficiencyLevel: level.value as Settings['proficiencyLevel'] })}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                settings.proficiencyLevel === level.value
                  ? 'bg-accent/10 ring-1 ring-accent/40'
                  : 'bg-surface-3 hover:bg-surface-4'
              }`}
            >
              <div>
                <div className="text-sm font-medium text-white/90">{level.label}</div>
                <div className="text-xs text-white/40">{level.desc}</div>
              </div>
              {settings.proficiencyLevel === level.value && (
                <span className="text-accent text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
