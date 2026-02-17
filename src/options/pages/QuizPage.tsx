import type { Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
}

const QUIZ_TYPES = [
  { value: 'multipleChoice' as const, label: 'Multiple Choice', desc: 'Pick the correct translation' },
  { value: 'typeAnswer' as const, label: 'Type Answer', desc: 'Type the translation from memory' },
  { value: 'listenType' as const, label: 'Listen & Type', desc: 'Hear the word, type its meaning' },
];

const FREQUENCIES = [
  { value: 5, label: 'Every 5 min' },
  { value: 15, label: 'Every 15 min' },
  { value: 30, label: 'Every 30 min' },
  { value: 60, label: 'Every hour' },
];

export function QuizPage({ settings, onChange }: Props) {
  const toggleQuizType = (type: Settings['quizTypes'][number]) => {
    const current = settings.quizTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    if (updated.length > 0) {
      onChange({ quizTypes: updated });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Quiz Settings</h2>

      {/* Enable/disable */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white/90">Quick Quizzes</h3>
            <p className="text-xs text-white/40 mt-1">
              Show quiz toasts while browsing to reinforce learning
            </p>
          </div>
          <Toggle
            checked={settings.quizEnabled}
            onChange={(v) => onChange({ quizEnabled: v })}
          />
        </div>
      </section>

      {/* Quiz types */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <h3 className="text-sm font-medium text-white/70 mb-3">Quiz Types</h3>
        <div className="space-y-2">
          {QUIZ_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleQuizType(type.value)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                settings.quizTypes.includes(type.value)
                  ? 'bg-accent/10 ring-1 ring-accent/40'
                  : 'bg-surface-3 hover:bg-surface-4'
              }`}
            >
              <div>
                <div className="text-sm font-medium text-white/90">{type.label}</div>
                <div className="text-xs text-white/40">{type.desc}</div>
              </div>
              {settings.quizTypes.includes(type.value) && (
                <span className="text-accent text-sm">✓</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Frequency */}
      <section className="bg-surface-2 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white/70 mb-3">Quiz Frequency</h3>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((freq) => (
            <button
              key={freq.value}
              onClick={() => onChange({ quizFrequencyMinutes: freq.value })}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                settings.quizFrequencyMinutes === freq.value
                  ? 'bg-accent/10 ring-1 ring-accent/40 text-accent'
                  : 'bg-surface-3 text-white/50 hover:bg-surface-4'
              }`}
            >
              {freq.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-surface-4'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}
