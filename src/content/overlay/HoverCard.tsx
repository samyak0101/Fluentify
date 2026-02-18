export interface HoverCardData {
  original: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?: string;
  gender?: string;
  position: { x: number; y: number };
}

interface HoverCardProps {
  data: HoverCardData;
  onDismiss: () => void;
}

/** Format part of speech abbreviation to full word */
function formatPOS(pos?: string): string {
  const map: Record<string, string> = {
    n: 'noun',
    v: 'verb',
    adj: 'adjective',
    adv: 'adverb',
    prep: 'preposition',
    conj: 'conjunction',
    art: 'article',
    pron: 'pronoun',
    det: 'determiner',
    num: 'number',
  };
  return pos ? map[pos] ?? pos : '';
}

/** Format gender abbreviation */
function formatGender(g?: string): string {
  return g === 'm' ? 'masc.' : g === 'f' ? 'fem.' : '';
}

/**
 * Floating translation hover card.
 * Shows target word, English translation, pronunciation, and quick actions.
 */
export function HoverCard({ data, onDismiss }: HoverCardProps) {
  const { original, translation, pronunciation, partOfSpeech, gender, position } = data;

  // Clamp position to viewport
  const x = Math.min(position.x, window.innerWidth - 300);
  const y = Math.min(position.y, window.innerHeight - 200);

  const metaParts = [formatPOS(partOfSpeech), formatGender(gender)].filter(Boolean);

  const handleAudio = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(translation);
      // Use the ttsLang from the language config stored in the span's data attribute
      const span = document.querySelector('[data-fluentify-lang]') as HTMLElement | null;
      const ttsLang = span?.dataset?.fluentifyLang ?? 'fr-FR';
      utterance.lang = ttsLang;
      utterance.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch {
      // TTS not available — silent fail
    }
  };

  return (
    <div
      className="hover-card"
      style={{ left: `${x}px`, top: `${y}px` }}
      onMouseEnter={(e) => e.stopPropagation()}
      role="tooltip"
      aria-label={`${translation} means ${original}`}
    >
      <div className="hover-card-inner">
        {/* Target language word */}
        <div className="word-target">
          <span>{translation}</span>
          <button
            className="btn-audio"
            onClick={handleAudio}
            aria-label="Play pronunciation"
            title="Play pronunciation"
          >
            🔊
          </button>
        </div>

        {/* English translation */}
        <div className="word-translation">→ {original}</div>

        {/* Pronunciation */}
        {pronunciation && (
          <div className="word-pronunciation">{pronunciation}</div>
        )}

        {/* Part of speech / gender */}
        {metaParts.length > 0 && (
          <div className="word-meta">{metaParts.join(' · ')}</div>
        )}

        {/* Actions */}
        <div className="actions">
          <button
            className="btn-add"
            onClick={() => {
              // TODO: Phase 3 — add to SRS deck
              onDismiss();
            }}
            aria-label="Add to vocabulary deck"
          >
            + Add to deck
          </button>
          <button
            className="btn-skip"
            onClick={onDismiss}
            aria-label="Skip this word"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
