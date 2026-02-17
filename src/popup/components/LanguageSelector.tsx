import { LANGUAGES } from '@/data/config/languages';

interface Props {
  value: string;
  onChange: (lang: string) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface-2 text-white/60 text-xs rounded-lg px-3 py-1.5 pr-6 cursor-pointer hover:bg-surface-3 transition-colors border-none outline-none focus:ring-1 focus:ring-accent/50"
        aria-label="Target language"
      >
        {Object.values(LANGUAGES).map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      {/* Current flag indicator */}
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
        ▾
      </span>
    </div>
  );
}
