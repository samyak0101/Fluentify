interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function IntensitySlider({ value, onChange, disabled }: Props) {
  const percentage = Math.round(value * 100);

  return (
    <div className={`bg-surface-2 rounded-xl p-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
          Intensity
        </span>
        <span className="text-sm font-semibold text-accent tabular-nums">
          {percentage}%
        </span>
      </div>
      <input
        type="range"
        min={5}
        max={50}
        step={5}
        value={percentage}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none bg-surface-4 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-accent
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110"
        aria-label={`Immersion intensity: ${percentage}%`}
      />
      <div className="flex justify-between text-[10px] text-white/20 mt-1">
        <span>Subtle</span>
        <span>Intense</span>
      </div>
    </div>
  );
}
