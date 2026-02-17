import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { OverlayApp } from './OverlayApp';

let shadowRoot: ShadowRoot | null = null;
let reactRoot: Root | null = null;

/** Overlay styles — injected into shadow DOM to avoid page style conflicts */
const OVERLAY_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .hover-card {
    position: fixed;
    z-index: 2147483647;
    pointer-events: auto;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    animation: fadeSlideIn 0.15s ease-out;
  }

  .hover-card-inner {
    background: #1A1A1A;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    min-width: 200px;
    max-width: 280px;
    color: white;
  }

  .hover-card .word-target {
    font-size: 18px;
    font-weight: 600;
    color: #FAFAFA;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .hover-card .word-translation {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 4px;
  }

  .hover-card .word-pronunciation {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    font-family: monospace;
    margin-bottom: 12px;
  }

  .hover-card .word-meta {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    margin-bottom: 12px;
  }

  .hover-card .actions {
    display: flex;
    gap: 8px;
  }

  .hover-card button {
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 0.15s ease;
    font-family: inherit;
  }

  .hover-card .btn-add {
    flex: 1;
    background: rgba(16,185,129,0.15);
    color: #34D399;
  }
  .hover-card .btn-add:hover { background: rgba(16,185,129,0.25); }

  .hover-card .btn-audio {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.5);
    padding: 6px 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hover-card .btn-audio:hover { background: rgba(255,255,255,0.1); }

  .hover-card .btn-skip {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.35);
  }
  .hover-card .btn-skip:hover { background: rgba(255,255,255,0.1); }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(4px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Quiz Toast */
  .quiz-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    pointer-events: auto;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    animation: slideInRight 0.3s ease-out;
    border-radius: 14px;
    transition: background 0.3s ease;
  }

  .quiz-toast-inner {
    background: #1A1A1A;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    min-width: 280px;
    max-width: 320px;
    color: white;
  }

  .quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .quiz-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }

  .quiz-actions-top { display: flex; gap: 4px; }

  .quiz-btn-small {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 4px;
    border-radius: 6px;
    color: rgba(255,255,255,0.3);
    transition: background 0.15s;
  }
  .quiz-btn-small:hover { background: rgba(255,255,255,0.08); }

  .quiz-question {
    font-size: 15px;
    color: rgba(255,255,255,0.85);
    margin-bottom: 14px;
    line-height: 1.4;
  }
  .quiz-question strong { color: #10B981; font-weight: 600; }

  .quiz-result {
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  .quiz-result.correct { background: rgba(16,185,129,0.12); color: #34D399; }
  .quiz-result.incorrect { background: rgba(239,68,68,0.12); color: #F87171; }

  .quiz-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }

  .quiz-option {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    font-size: 13px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    font-family: inherit;
  }
  .quiz-option:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
  .quiz-option.selected { border-color: #10B981; background: rgba(16,185,129,0.1); }

  .quiz-type-form {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .quiz-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: white;
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 8px;
    outline: none;
    font-family: inherit;
  }
  .quiz-input:focus { border-color: rgba(16,185,129,0.5); }
  .quiz-input::placeholder { color: rgba(255,255,255,0.25); }

  .quiz-submit {
    background: rgba(16,185,129,0.15);
    color: #34D399;
    border: none;
    font-size: 16px;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }
  .quiz-submit:hover { background: rgba(16,185,129,0.25); }

  .quiz-footer {
    text-align: right;
    font-size: 10px;
    color: rgba(255,255,255,0.15);
    margin-top: 4px;
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

/**
 * Mount the overlay system inside a Shadow DOM to isolate from page styles.
 */
export function mountOverlay(): void {
  if (shadowRoot) return; // Already mounted

  const host = document.createElement('div');
  host.id = 'fluentify-overlay';
  host.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(host);

  shadowRoot = host.attachShadow({ mode: 'closed' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = OVERLAY_STYLES;
  shadowRoot.appendChild(style);

  // Create React mount point
  const root = document.createElement('div');
  root.id = 'fluentify-root';
  shadowRoot.appendChild(root);

  reactRoot = createRoot(root);
  reactRoot.render(React.createElement(OverlayApp));
}

/** Unmount the overlay */
export function unmountOverlay(): void {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  const host = document.getElementById('fluentify-overlay');
  if (host) host.remove();
  shadowRoot = null;
}
