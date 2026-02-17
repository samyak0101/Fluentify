/**
 * Content script entry point — the Fluentify Immersion Engine.
 *
 * Flow:
 * 1. Load frequency data for the active language
 * 2. Scan the page for eligible text nodes
 * 3. Select words to replace based on intensity setting
 * 4. Replace words inline with styled foreign language spans
 * 5. Mount the hover card overlay (Shadow DOM)
 * 6. Watch for DOM mutations (SPA support)
 */

import { scanPage } from './immersion/scanner';
import { selectWordsForReplacement, clearSelectionCache } from './immersion/selector';
import { replaceWordsInNode, restoreAllReplacements, getReplacementCount } from './immersion/replacer';
import { observeDOM } from './immersion/observer';
import { mountOverlay, unmountOverlay } from './overlay/mount';
import { frequencyManager } from '@/lib/words/frequency';
import { speak } from '@/lib/audio/tts';
import { LANGUAGES } from '@/data/config/languages';
import type { FrequencyList } from '@/types';
import type { Settings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

/** Current settings (loaded from storage, updated via messages) */
let settings: Settings = { ...DEFAULT_SETTINGS };
let isActive = false;
let observer: MutationObserver | null = null;

/**
 * Load the frequency list for the target language.
 * Uses the extension's bundled JSON files.
 */
async function loadFrequencyData(lang: string): Promise<boolean> {
  try {
    const url = chrome.runtime.getURL(`data/frequencies/${lang}.json`);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[Fluentify] No frequency data for language: ${lang}`);
      return false;
    }
    const data: FrequencyList = await response.json();
    frequencyManager.load(data);
    clearSelectionCache();
    console.log(`[Fluentify] Loaded ${frequencyManager.size} words for ${lang}`);
    return true;
  } catch (err) {
    console.error('[Fluentify] Failed to load frequency data:', err);
    return false;
  }
}

/**
 * Core function: scan the page and replace words.
 */
function processPage(): void {
  if (!isActive || !frequencyManager.isLoaded()) return;

  const textNodes = scanPage();
  if (textNodes.length === 0) return;

  // Collect all words from the page
  const allWords: string[] = [];
  for (const { tokens } of textNodes) {
    for (const token of tokens) {
      if (token.isWord) allWords.push(token.text);
    }
  }

  // Select which words to replace
  const selections = selectWordsForReplacement(
    allWords,
    settings.immersionIntensity,
  );

  if (selections.size === 0) return;

  // Apply replacements
  let totalReplaced = 0;
  for (const { node, tokens } of textNodes) {
    // Skip if the node was already removed from the DOM
    if (!node.parentNode) continue;
    totalReplaced += replaceWordsInNode(node, tokens, selections);
  }

  if (totalReplaced > 0) {
    console.log(
      `[Fluentify] Replaced ${totalReplaced} words (${getReplacementCount()} total active)`,
    );
  }
}

/**
 * Check if the current domain is allowed.
 */
function isDomainAllowed(): boolean {
  const hostname = window.location.hostname;

  // Check blocklist
  if (settings.disabledDomains.some((d) => hostname.includes(d))) {
    return false;
  }

  // If allowlist is set, only those domains are allowed
  if (settings.enabledDomains.length > 0) {
    return settings.enabledDomains.some((d) => hostname.includes(d));
  }

  return true;
}

/**
 * Start the immersion engine.
 */
async function start(): Promise<void> {
  if (isActive) return;

  // Check domain
  if (!isDomainAllowed()) {
    console.log(`[Fluentify] Domain blocked: ${window.location.hostname}`);
    return;
  }

  // Load settings from storage
  try {
    const stored = await chrome.storage.sync.get(['settings', 'isPaused']);
    if (stored.settings) {
      settings = { ...DEFAULT_SETTINGS, ...stored.settings };
    }
    if (stored.isPaused) {
      console.log('[Fluentify] Extension is paused');
      return;
    }
  } catch {
    // Storage not available — use defaults
  }

  if (!settings.immersionEnabled) {
    console.log('[Fluentify] Immersion disabled in settings');
    return;
  }

  // Load frequency data
  const loaded = await loadFrequencyData(settings.targetLanguage);
  if (!loaded) return;

  isActive = true;

  // Mount the hover card overlay
  mountOverlay();

  // Add click-to-speak handler
  document.addEventListener('click', handleWordClick);

  // Initial page scan
  processPage();

  // Watch for DOM changes (SPA support)
  observer = observeDOM(() => {
    processPage();
  });

  console.log('[Fluentify] Immersion engine started');
}

/**
 * Stop the immersion engine and restore the page.
 */
function stop(): void {
  if (!isActive) return;

  isActive = false;

  // Disconnect observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Remove click handler
  document.removeEventListener('click', handleWordClick);

  // Restore all replacements
  restoreAllReplacements();

  // Unmount overlay
  unmountOverlay();

  console.log('[Fluentify] Immersion engine stopped');
}

/**
 * Handle click on a replaced word — play pronunciation.
 */
function handleWordClick(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest?.('.fluentify-word') as HTMLElement | null;
  if (!target) return;

  const translation = target.dataset.fluentifyTranslation;
  if (!translation) return;

  const langConfig = LANGUAGES[settings.targetLanguage];
  const ttsLang = langConfig?.ttsLang ?? settings.targetLanguage;

  speak(translation, ttsLang, {
    rate: settings.ttsRate,
    volume: settings.ttsVolume,
  }).catch(() => {
    // TTS not available — silent fail
  });
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'SETTINGS_UPDATED':
      settings = { ...DEFAULT_SETTINGS, ...message.settings };
      // Restart with new settings
      stop();
      start();
      sendResponse({ ok: true });
      break;

    case 'PAUSE':
      stop();
      sendResponse({ ok: true });
      break;

    case 'RESUME':
      start();
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ ok: true });
  }
  return true;
});

// Start on load
start();
