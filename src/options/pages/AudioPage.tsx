import type { Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
}

export function AudioPage({ settings, onChange }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Audio Settings</h2>

      {/* Auto-pronounce */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white/90">Auto-pronounce on hover</h3>
            <p className="text-xs text-white/40 mt-1">
              Automatically play pronunciation when hovering over words
            </p>
          </div>
          <Toggle
            checked={settings.autoPronounce}
            onChange={(v) => onChange({ autoPronounce: v })}
          />
        </div>
      </section>

      {/* Speed */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70">Speech Speed</h3>
          <span className="text-sm font-semibold text-white/60 tabular-nums">
            {settings.ttsRate.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          step={10}
          value={Math.round(settings.ttsRate * 100)}
          onChange={(e) => onChange({ ttsRate: Number(e.target.value) / 100 })}
          className="w-full h-1.5 rounded-full appearance-none bg-surface-4 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
          aria-label="Speech speed"
        />
        <div className="flex justify-between text-[10px] text-white/20 mt-1">
          <span>0.5x Slow</span>
          <span>1.0x Normal</span>
          <span>2.0x Fast</span>
        </div>
      </section>

      {/* Volume */}
      <section className="bg-surface-2 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70">Volume</h3>
          <span className="text-sm font-semibold text-white/60 tabular-nums">
            {Math.round(settings.ttsVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(settings.ttsVolume * 100)}
          onChange={(e) => onChange({ ttsVolume: Number(e.target.value) / 100 })}
          className="w-full h-1.5 rounded-full appearance-none bg-surface-4 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
          aria-label="Volume"
        />
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
