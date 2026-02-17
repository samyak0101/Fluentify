import type { DailyStats } from '@/types';

interface Props {
  stats: DailyStats;
}

export function StatsCard({ stats }: Props) {
  return (
    <div className="bg-surface-2 rounded-xl p-4">
      <h2 className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-3">
        Today
      </h2>
      <div className="space-y-2.5">
        <StatRow emoji="📖" label="Words seen" value={stats.wordsSeen} />
        <StatRow emoji="✅" label="Words learned" value={stats.wordsLearned} />
        <StatRow emoji="🔄" label="Reviews due" value={stats.reviewsDue} />
        {stats.reviewsCompleted > 0 && (
          <StatRow emoji="🎯" label="Reviews done" value={stats.reviewsCompleted} />
        )}
        {stats.quizTotal > 0 && (
          <StatRow
            emoji="🧠"
            label="Quiz accuracy"
            value={`${Math.round((stats.quizCorrect / stats.quizTotal) * 100)}%`}
          />
        )}
      </div>
    </div>
  );
}

function StatRow({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">
        {emoji} {label}
      </span>
      <span className="font-semibold text-white/90 tabular-nums">{value}</span>
    </div>
  );
}
