import { useState, useCallback } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { getAllWords, getDB } from '@/lib/storage/idb';

export function DataPage() {
  const [status, setStatus] = useState<string>('');

  const handleExportJSON = useCallback(async () => {
    try {
      const words = await getAllWords();
      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        wordCount: words.length,
        words,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluentify-vocab-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Exported ${words.length} words`);
    } catch (err) {
      setStatus(`Export failed: ${err}`);
    }
  }, []);

  const handleExportAnki = useCallback(async () => {
    try {
      const words = await getAllWords();
      // Anki TSV format: front\tback
      const lines = words.map(
        (w) => `${w.word}\t${w.translation}\t${w.pronunciation ?? ''}\t${w.partOfSpeech ?? ''}`,
      );
      const tsv = lines.join('\n');
      const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluentify-anki-${new Date().toISOString().split('T')[0]}.tsv`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Exported ${words.length} words for Anki`);
    } catch (err) {
      setStatus(`Export failed: ${err}`);
    }
  }, []);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.words || !Array.isArray(data.words)) {
          setStatus('Invalid file format');
          return;
        }

        const db = await getDB();
        let imported = 0;
        for (const word of data.words) {
          if (word.id && word.word && word.translation) {
            await db.put('vocabulary', word);
            imported++;
          }
        }
        setStatus(`Imported ${imported} words`);
      } catch (err) {
        setStatus(`Import failed: ${err}`);
      }
    };
    input.click();
  }, []);

  const handleClearData = useCallback(async () => {
    if (!confirm('This will delete ALL your vocabulary data. Are you sure?')) return;

    try {
      const db = await getDB();
      await db.clear('vocabulary');
      await db.clear('translations');
      await db.clear('encounters');
      await chrome.storage.local.clear();
      setStatus('All data cleared');
    } catch (err) {
      setStatus(`Clear failed: ${err}`);
    }
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Data Management</h2>

      {status && (
        <div className="bg-surface-2 rounded-lg px-4 py-2 mb-4 text-sm text-accent">
          {status}
        </div>
      )}

      {/* Export */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <h3 className="text-sm font-medium text-white/70 mb-4">Export Vocabulary</h3>
        <div className="space-y-3">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 p-3 bg-surface-3 rounded-lg text-sm text-white/70 hover:bg-surface-4 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export as JSON (full data)
          </button>
          <button
            onClick={handleExportAnki}
            className="w-full flex items-center gap-3 p-3 bg-surface-3 rounded-lg text-sm text-white/70 hover:bg-surface-4 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export for Anki (TSV)
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="bg-surface-2 rounded-xl p-6 mb-4">
        <h3 className="text-sm font-medium text-white/70 mb-4">Import Vocabulary</h3>
        <button
          onClick={handleImport}
          className="w-full flex items-center gap-3 p-3 bg-surface-3 rounded-lg text-sm text-white/70 hover:bg-surface-4 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import from JSON file
        </button>
      </section>

      {/* Danger zone */}
      <section className="bg-surface-2 rounded-xl p-6 border border-red-500/10">
        <h3 className="text-sm font-medium text-red-400/70 mb-4">Danger Zone</h3>
        <button
          onClick={handleClearData}
          className="w-full flex items-center gap-3 p-3 bg-red-500/10 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear all data
        </button>
        <p className="text-xs text-white/20 mt-2">
          This permanently deletes all vocabulary, settings, and cached translations.
        </p>
      </section>
    </div>
  );
}
