/**
 * Background service worker — handles message routing, translation,
 * SRS scheduling, and badge updates.
 * Stubbed for Phase 1; will be fleshed out in later phases.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Fluentify] Extension installed');
});

// Placeholder message listener — expanded in Phase 2+
chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  sendResponse({ ok: true });
  return true;
});
