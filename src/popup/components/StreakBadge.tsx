import { Flame } from 'lucide-react';

interface Props {
  count: number;
}

export function StreakBadge({ count }: Props) {
  const isActive = count > 0;

  return (
    <div className="flex items-center gap-1.5">
      <Flame
        className={`w-5 h-5 ${
          isActive ? 'text-orange-400' : 'text-white/20'
        }`}
        fill={isActive ? 'currentColor' : 'none'}
      />
      <span
        className={`text-sm font-semibold ${
          isActive ? 'text-orange-400' : 'text-white/30'
        }`}
      >
        {count}-day streak
      </span>
    </div>
  );
}
