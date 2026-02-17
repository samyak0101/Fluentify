import { isEligibleTextNode } from '@/lib/utils/dom';
import { tokenize, type Token } from '@/lib/utils/text';

export interface TextNodeInfo {
  node: Text;
  text: string;
  tokens: Token[];
}

/**
 * Walks the DOM tree and finds all text nodes eligible for word replacement.
 * Skips scripts, styles, inputs, code blocks, and hidden elements.
 */
export function scanPage(): TextNodeInfo[] {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return isEligibleTextNode(node as Text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );

  const results: TextNodeInfo[] = [];
  let current = walker.nextNode();

  while (current) {
    const text = current.textContent ?? '';
    const tokens = tokenize(text);
    const wordTokens = tokens.filter((t) => t.isWord);

    // Only include nodes that have at least one actual word
    if (wordTokens.length > 0) {
      results.push({ node: current as Text, text, tokens });
    }

    current = walker.nextNode();
  }

  return results;
}
