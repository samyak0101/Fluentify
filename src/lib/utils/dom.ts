/** Tags that should never have their text replaced */
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'CODE',
  'PRE', 'KBD', 'NOSCRIPT', 'SVG', 'MATH', 'CANVAS',
]);

/**
 * Check if a text node's parent is eligible for word replacement.
 */
export function isEligibleTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return false;

  // Skip certain tag types
  if (SKIP_TAGS.has(parent.tagName)) return false;

  // Skip contenteditable regions
  if (parent.isContentEditable) return false;

  // Skip elements explicitly marked to skip
  if (parent.closest('[data-fluentify-skip]')) return false;

  // Skip already-replaced elements
  if (parent.closest('.fluentify-word')) return false;

  // Skip hidden elements
  const style = getComputedStyle(parent);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  // Skip very short text
  const text = node.textContent?.trim();
  if (!text || text.length < 2) return false;

  return true;
}
