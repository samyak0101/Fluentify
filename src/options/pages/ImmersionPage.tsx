import { useState } from 'react';
import type { Settings } from '@/types/settings';

interface Props {
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
}

export function ImmersionPage({ settings, onChange }: Props) {
  const [newDomain, setNewDomain] = useState('');

  const addBlockedDomain = () => {
    const domain = newDomain.trim().toLowerCase();
    if (!domain || settings.disabledDomains.includes(domain)) return;
    onChange({ disabledDomains: [...settings.disabledDomains, domain] });
    setNewDomain('');
  };

  const removeBlockedDomain = (domain: string) => {
    onChange({ disabledDomains: settings.disabledDomains.filter((d) => d !== domain) });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Immersion Settings</h2>

      {/* Enable/disable */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white/90">Immersion Mode</h3>
            <p className="text-xs text-white/40 mt-1">Replace words on pages with target language</p>
          </div>
          <Toggle
            checked={settings.immersionEnabled}
            onChange={(v) => onChange({ immersionEnabled: v })}
          />
        </div>
      </section>

      {/* Intensity */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70">Intensity</h3>
          <span className="text-sm font-semibold text-accent tabular-nums">
            {Math.round(settings.immersionIntensity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={Math.round(settings.immersionIntensity * 100)}
          onChange={(e) => onChange({ immersionIntensity: Number(e.target.value) / 100 })}
          className="w-full h-1.5 rounded-full appearance-none bg-surface-4 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/20 mt-1">
          <span>5% — Subtle</span>
          <span>50% — Intense</span>
        </div>
      </section>

      {/* Highlight style */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <h3 className="text-sm font-medium text-white/70 mb-3">Word Highlight Style</h3>
        <div className="flex gap-3">
          {(['underline', 'background', 'italic'] as const).map((style) => (
            <button
              key={style}
              onClick={() => onChange({ highlightStyle: style })}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                settings.highlightStyle === style
                  ? 'bg-accent/10 ring-1 ring-accent/40 text-accent'
                  : 'bg-surface-3 text-white/50 hover:bg-surface-4'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Blocked domains */}
      <section className="bg-surface-2 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white/70 mb-3">Blocked Domains</h3>
        <p className="text-xs text-white/30 mb-4">Fluentify won't run on these sites</p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBlockedDomain()}
            placeholder="e.g. mail.google.com"
            className="flex-1 bg-surface-3 text-white/80 text-sm px-3 py-2 rounded-lg border border-white/5 outline-none focus:ring-1 focus:ring-accent/50"
          />
          <button
            onClick={addBlockedDomain}
            className="px-4 py-2 bg-surface-3 text-white/50 text-sm rounded-lg hover:bg-surface-4 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="space-y-1">
          {settings.disabledDomains.map((domain) => (
            <div
              key={domain}
              className="flex items-center justify-between bg-surface-3 px-3 py-2 rounded-lg"
            >
              <span className="text-sm text-white/60">{domain}</span>
              <button
                onClick={() => removeBlockedDomain(domain)}
                className="text-white/20 hover:text-red-400 text-xs transition-colors"
              >
                ✕
              </button>
            </div>
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
