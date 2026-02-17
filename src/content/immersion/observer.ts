import { throttle } from '@/lib/utils/throttle';

/**
 * Observes DOM mutations for SPA support.
 * Calls the callback when new content is added (throttled to max 1/sec).
 */
export function observeDOM(onNewContent: () => void): MutationObserver {
  const throttledCallback = throttle(
    (mutations: MutationRecord[]) => {
      const hasNewText = mutations.some(
        (m) => m.addedNodes.length > 0 || m.type === 'characterData',
      );
      if (hasNewText) onNewContent();
    },
    1000,
  );

  const observer = new MutationObserver((mutations) => {
    throttledCallback(mutations);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}
