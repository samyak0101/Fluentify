/**
 * Chrome Storage API wrapper for extension settings and small data.
 * Uses chrome.storage.sync for settings (syncs across devices)
 * and chrome.storage.local for larger data (paused state, etc.)
 */

import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import type { DailyStats } from '@/types';

const DEFAULT_STATS: DailyStats = {
  date: new Date().toISOString().split('T')[0],
  wordsSeen: 0,
  wordsLearned: 0,
  reviewsDue: 0,
  reviewsCompleted: 0,
  quizCorrect: 0,
  quizTotal: 0,
  streak: 0,
};

export class ChromeStorage {
  /** Get all settings, merged with defaults */
  static async getSettings(): Promise<Settings> {
    try {
      const result = await chrome.storage.sync.get('settings');
      return { ...DEFAULT_SETTINGS, ...(result.settings ?? {}) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  /** Save settings (partial update) */
  static async saveSettings(partial: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    const merged = { ...current, ...partial };
    await chrome.storage.sync.set({ settings: merged });
  }

  /** Check if extension is paused */
  static async isPaused(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get('isPaused');
      return result.isPaused === true;
    } catch {
      return false;
    }
  }

  /** Set paused state */
  static async setPaused(paused: boolean): Promise<void> {
    await chrome.storage.local.set({ isPaused: paused });
  }

  /** Get today's stats */
  static async getDailyStats(): Promise<DailyStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await chrome.storage.local.get('dailyStats');
      const stats = result.dailyStats as DailyStats | undefined;
      if (stats && stats.date === today) return stats;
      // New day — reset stats but preserve streak
      return { ...DEFAULT_STATS, date: today, streak: stats?.streak ?? 0 };
    } catch {
      return { ...DEFAULT_STATS };
    }
  }

  /** Update daily stats (partial) */
  static async updateDailyStats(
    updater: (current: DailyStats) => Partial<DailyStats>,
  ): Promise<DailyStats> {
    const current = await this.getDailyStats();
    const updated = { ...current, ...updater(current) };
    await chrome.storage.local.set({ dailyStats: updated });
    return updated;
  }

  /** Get streak data */
  static async getStreak(): Promise<{ count: number; lastDate: string }> {
    try {
      const result = await chrome.storage.local.get('streak');
      return result.streak ?? { count: 0, lastDate: '' };
    } catch {
      return { count: 0, lastDate: '' };
    }
  }

  /** Update streak (call when user learns a word or completes a review) */
  static async updateStreak(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count, lastDate } = await this.getStreak();

    if (lastDate === today) return count; // Already counted today

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];
    const newCount = lastDate === yesterday ? count + 1 : 1;

    await chrome.storage.local.set({
      streak: { count: newCount, lastDate: today },
    });
    return newCount;
  }
}
