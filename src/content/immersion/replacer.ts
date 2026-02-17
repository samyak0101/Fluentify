import type { WordSelection } from './selector';
import type { Token } from '@/lib/utils/text';

/** Track all replacements so we can undo them */
const replacedElements = new Set<HTMLSpanElement>();

/**
 * Replace selected words within a text node with styled foreign language spans.
 * Splits the text node and inserts span elements for matched words.
 *
 * @param textNode - The DOM text node to process
 * @param tokens - Pre-tokenized tokens from this text node
 * @param selections - Map of lowercase English word → WordSelection
 * @returns Number of words replaced in this node
 */
export function replaceWordsInNode(
  textNode: Text,
  tokens: Token[],
  selections: Map<string, WordSelection>,
): number {
  // Find which tokens should be replaced
  const replacements: Array<{ token: Token; selection: WordSelection }> = [];

  for (const token of tokens) {
    if (!token.isWord) continue;
    const selection = selections.get(token.text.toLowerCase());
    if (selection) {
      replacements.push({ token, selection });
    }
  }

  if (replacements.length === 0) return 0;

  // Build a document fragment with the mixed content
  const fragment = document.createDocumentFragment();
  const fullText = textNode.textContent ?? '';
  let lastEnd = 0;

  for (const { token, selection } of replacements) {
    // Add text before this replacement
    if (token.start > lastEnd) {
      fragment.appendChild(
        document.createTextNode(fullText.slice(lastEnd, token.start)),
      );
    }

    // Create the replacement span
    const span = document.createElement('span');
    span.className = 'fluentify-word';
    span.textContent = selection.translation;
    span.dataset.fluentifyOriginal = token.text;
    span.dataset.fluentifyTranslation = selection.translation;
    if (selection.pronunciation) {
      span.dataset.fluentifyPronunciation = selection.pronunciation;
    }
    if (selection.partOfSpeech) {
      span.dataset.fluentifyPos = selection.partOfSpeech;
    }
    if (selection.gender) {
      span.dataset.fluentifyGender = selection.gender;
    }

    // Accessibility
    span.setAttribute('role', 'button');
    span.setAttribute('tabindex', '0');
    span.setAttribute(
      'aria-label',
      `${selection.translation} means ${token.text}`,
    );

    fragment.appendChild(span);
    replacedElements.add(span);
    lastEnd = token.end;
  }

  // Add any remaining text after the last replacement
  if (lastEnd < fullText.length) {
    fragment.appendChild(document.createTextNode(fullText.slice(lastEnd)));
  }

  // Replace the original text node with our fragment
  const parent = textNode.parentNode;
  if (parent) {
    parent.replaceChild(fragment, textNode);
  }

  return replacements.length;
}

/**
 * Remove all Fluentify replacements and restore original text.
 */
export function restoreAllReplacements(): void {
  for (const span of replacedElements) {
    const original = span.dataset.fluentifyOriginal;
    if (original && span.parentNode) {
      const textNode = document.createTextNode(original);
      span.parentNode.replaceChild(textNode, span);
    }
  }
  replacedElements.clear();
}

/** Get count of currently active replacements */
export function getReplacementCount(): number {
  return replacedElements.size;
}
