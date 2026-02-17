import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Mic, Pause, Play, Settings as SettingsIcon } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { IntensitySlider } from './components/IntensitySlider';
import { StreakBadge } from './components/StreakBadge';
import { LanguageSelector } from './components/LanguageSelector';
import type { DailyStats } from '@/types';
import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const DEFAULT_STATS: DailyStats = {
  date: '',
  wordsSeen: 0,
  wordsLearned: 0,
  reviewsDue: 0,
  reviewsCompleted: 0,
  quizCorrect: 0,
  quizTotal: 0,
  streak: 0,
};

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<DailyStats>(DEFAULT_STATS);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await chrome.storage.sync.get('settings');
      if (result.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
      }

      const local = await chrome.storage.local.get(['isPaused', 'dailyStats', 'streak']);
      setIsPaused(local.isPaused === true);

      if (local.dailyStats) {
        const today = new Date().toISOString().split('T')[0];
        if (local.dailyStats.date === today) {
          setStats(local.dailyStats);
        }
      }

      if (local.streak) {
        setStreak(local.streak.count ?? 0);
      }
    } catch {
      // Extension context not available (dev mode)
    }
  };

  const handleTogglePause = useCallback(async () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    try {
      await chrome.storage.local.set({ isPaused: newPaused });
      // Notify content scripts
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: newPaused ? 'PAUSE' : 'RESUME' });
        }
      }
    } catch {
      // Silent fail
    }
  }, [isPaused]);

  const handleIntensityChange = useCallback(
    async (intensity: number) => {
      const newSettings = { ...settings, immersionIntensity: intensity };
      setSettings(newSettings);
      try {
        await chrome.storage.sync.set({ settings: newSettings });
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings: newSettings });
          }
        }
      } catch {
        // Silent fail
      }
    },
    [settings],
  );

  const handleLanguageChange = useCallback(
    async (lang: string) => {
      const newSettings = { ...settings, targetLanguage: lang };
      setSettings(newSettings);
      try {
        await chrome.storage.sync.set({ settings: newSettings });
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings: newSettings });
          }
        }
      } catch {
        // Silent fail
      }
    },
    [settings],
  );

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="flex flex-col h-[480px] bg-surface-0 text-white p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <StreakBadge count={streak} />
        <button
          onClick={handleOpenOptions}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Stats */}
      <StatsCard stats={stats} />

      {/* Intensity slider */}
      <div className="mt-4">
        <IntensitySlider
          value={settings.immersionIntensity}
          onChange={handleIntensityChange}
          disabled={isPaused}
        />
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-4">
        <button
          className="w-full py-2.5 rounded-lg bg-accent/15 text-accent font-medium text-sm hover:bg-accent/25 transition-colors flex items-center justify-center gap-2"
          onClick={handleOpenOptions}
        >
          <BookOpen className="w-4 h-4" />
          Start Lesson
        </button>
        <button
          className="w-full py-2.5 rounded-lg bg-surface-2 text-white/50 text-sm hover:bg-surface-3 transition-colors flex items-center justify-center gap-2"
        >
          <Mic className="w-4 h-4" />
          Recite Page
        </button>
      </div>

      {/* Bottom controls */}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <button
          onClick={handleTogglePause}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isPaused
              ? 'bg-accent/15 text-accent hover:bg-accent/25'
              : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5" /> Resume
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          )}
        </button>

        <LanguageSelector
          value={settings.targetLanguage}
          onChange={handleLanguageChange}
        />
      </div>
    </div>
  );
}
