import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Globe, Sliders, Volume2, Brain, Database, Info } from 'lucide-react';
import { LanguagePage } from './pages/LanguagePage';
import { ImmersionPage } from './pages/ImmersionPage';
import { AudioPage } from './pages/AudioPage';
import { QuizPage } from './pages/QuizPage';
import { DataPage } from './pages/DataPage';
import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

type Page = 'language' | 'immersion' | 'audio' | 'quiz' | 'data' | 'about';

const NAV_ITEMS: Array<{ id: Page; label: string; icon: typeof Globe }> = [
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'immersion', label: 'Immersion', icon: Sliders },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'quiz', label: 'Quizzes', icon: Brain },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

export default function App() {
  const [page, setPage] = useState<Page>('language');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get('settings');
      if (result.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
      }
    } catch {
      // Dev mode
    }
  };

  const updateSettings = useCallback(
    async (partial: Partial<Settings>) => {
      const merged = { ...settings, ...partial };
      setSettings(merged);
      try {
        await chrome.storage.sync.set({ settings: merged });
        // Notify content scripts
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings: merged }).catch(() => {});
          }
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        // Silent fail
      }
    },
    [settings],
  );

  const renderPage = () => {
    switch (page) {
      case 'language':
        return <LanguagePage settings={settings} onChange={updateSettings} />;
      case 'immersion':
        return <ImmersionPage settings={settings} onChange={updateSettings} />;
      case 'audio':
        return <AudioPage settings={settings} onChange={updateSettings} />;
      case 'quiz':
        return <QuizPage settings={settings} onChange={updateSettings} />;
      case 'data':
        return <DataPage />;
      case 'about':
        return <AboutPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-0 text-white">
      {/* Sidebar */}
      <nav className="w-60 bg-surface-1 border-r border-white/5 p-4 flex flex-col">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <SettingsIcon className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold">Fluentify</h1>
        </div>

        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto text-xs text-white/20 px-2">
          Fluentify v1.0.0
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-8 max-w-3xl">
        {saved && (
          <div className="fixed top-4 right-4 bg-accent/15 text-accent text-sm px-4 py-2 rounded-lg animate-fade-in">
            ✓ Settings saved
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">About Fluentify</h2>
      <div className="bg-surface-2 rounded-xl p-6 space-y-4">
        <p className="text-white/60 text-sm leading-relaxed">
          Fluentify transforms every webpage into a personalized language lesson.
          It replaces words you're ready to learn with their target language equivalents,
          using spaced repetition to maximize retention.
        </p>
        <div className="text-sm space-y-2 text-white/40">
          <p>Version: 1.0.0</p>
          <p>Built with React, TypeScript, and Tailwind CSS</p>
          <p>SRS Algorithm: SM-2 (SuperMemo 2)</p>
        </div>
        <div className="pt-2">
          <p className="text-xs text-white/25">
            No data is collected. Everything stays in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
