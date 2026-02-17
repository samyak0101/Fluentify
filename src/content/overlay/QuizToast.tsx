import { useState, useCallback } from 'react';

export type QuizType = 'multipleChoice' | 'typeAnswer';

export interface QuizQuestion {
  wordId: string;
  targetWord: string;
  correctAnswer: string;
  type: QuizType;
  /** For multiple choice — 4 options including the correct one */
  options?: string[];
}

interface QuizToastProps {
  question: QuizQuestion;
  onAnswer: (wordId: string, correct: boolean) => void;
  onDismiss: () => void;
  onSnooze: () => void;
}

/**
 * Non-intrusive quiz toast that appears in the bottom-right corner.
 * Supports multiple choice and type-the-answer quiz modes.
 */
export function QuizToast({ question, onAnswer, onDismiss, onSnooze }: QuizToastProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const checkAnswer = useCallback(
    (answer: string) => {
      const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      setResult(isCorrect ? 'correct' : 'incorrect');
      onAnswer(question.wordId, isCorrect);

      // Auto-dismiss after showing result
      setTimeout(() => {
        onDismiss();
      }, 1500);
    },
    [question, onAnswer, onDismiss],
  );

  const handleOptionClick = (option: string) => {
    if (result) return; // Already answered
    setSelected(option);
    checkAnswer(option);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim() || result) return;
    checkAnswer(typedAnswer);
  };

  const bgColor = result === 'correct'
    ? 'rgba(16, 185, 129, 0.08)'
    : result === 'incorrect'
      ? 'rgba(239, 68, 68, 0.08)'
      : 'transparent';

  return (
    <div
      className="quiz-toast"
      style={{ background: bgColor }}
      role="dialog"
      aria-label="Vocabulary quiz"
    >
      <div className="quiz-toast-inner">
        {/* Header */}
        <div className="quiz-header">
          <span className="quiz-label">🧠 Quick Quiz</span>
          <div className="quiz-actions-top">
            <button onClick={onSnooze} className="quiz-btn-small" title="Snooze for 30 min">
              💤
            </button>
            <button onClick={onDismiss} className="quiz-btn-small" title="Dismiss">
              ✕
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="quiz-question">
          What does "<strong>{question.targetWord}</strong>" mean?
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`quiz-result ${result}`}>
            {result === 'correct' ? '✅ Correct!' : `❌ It means: ${question.correctAnswer}`}
          </div>
        )}

        {/* Multiple choice */}
        {question.type === 'multipleChoice' && question.options && !result && (
          <div className="quiz-options">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className={`quiz-option ${selected === option ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Type answer */}
        {question.type === 'typeAnswer' && !result && (
          <form onSubmit={handleTypeSubmit} className="quiz-type-form">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type the translation..."
              className="quiz-input"
              autoFocus
            />
            <button type="submit" className="quiz-submit">
              →
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="quiz-footer">
          Fluentify
        </div>
      </div>
    </div>
  );
}

/**
 * Generate a multiple choice question from a word and distractor pool.
 */
export function generateMultipleChoiceQuestion(
  wordId: string,
  targetWord: string,
  correctAnswer: string,
  distractorPool: string[],
): QuizQuestion {
  // Pick 3 random distractors
  const distractors = shuffleArray(
    distractorPool.filter((d) => d.toLowerCase() !== correctAnswer.toLowerCase()),
  ).slice(0, 3);

  // Combine with correct answer and shuffle
  const options = shuffleArray([correctAnswer, ...distractors]);

  return {
    wordId,
    targetWord,
    correctAnswer,
    type: 'multipleChoice',
    options,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
