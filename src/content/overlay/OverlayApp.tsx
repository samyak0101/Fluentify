import { useState, useEffect, useCallback, useRef } from 'react';
import { HoverCard, type HoverCardData } from './HoverCard';
import { QuizToast, generateMultipleChoiceQuestion, type QuizQuestion } from './QuizToast';
import { frequencyManager } from '@/lib/words/frequency';

/**
 * Root overlay component — manages hover card and quiz toast visibility.
 */
export function OverlayApp() {
  const [hoverData, setHoverData] = useState<HoverCardData | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const snoozedUntilRef = useRef<number>(0);

  const showCard = useCallback((data: HoverCardData) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoverData(data);
  }, []);

  const hideCard = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoverData(null);
      hideTimeoutRef.current = null;
    }, 150);
  }, []);

  // Hover card event listeners
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.('.fluentify-word') as HTMLElement | null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      showCard({
        original: target.dataset.fluentifyOriginal ?? '',
        translation: target.dataset.fluentifyTranslation ?? '',
        pronunciation: target.dataset.fluentifyPronunciation,
        partOfSpeech: target.dataset.fluentifyPos,
        gender: target.dataset.fluentifyGender,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
        },
      });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest?.('.fluentify-word') || related?.closest?.('.hover-card')) return;
      hideCard();
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList?.contains('fluentify-word')) return;
      const rect = target.getBoundingClientRect();
      showCard({
        original: target.dataset.fluentifyOriginal ?? '',
        translation: target.dataset.fluentifyTranslation ?? '',
        pronunciation: target.dataset.fluentifyPronunciation,
        partOfSpeech: target.dataset.fluentifyPos,
        gender: target.dataset.fluentifyGender,
        position: { x: rect.left + rect.width / 2, y: rect.bottom + 8 },
      });
    };

    const handleFocusOut = () => hideCard();

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [showCard, hideCard]);

  // Quiz timer — shows a quiz every N minutes
  useEffect(() => {
    const showQuizIfReady = () => {
      if (quiz) return; // Already showing
      if (Date.now() < snoozedUntilRef.current) return; // Snoozed

      // Get replaced words on the page as quiz candidates
      const words = document.querySelectorAll('.fluentify-word');
      if (words.length < 4) return; // Need enough words for options

      // Pick a random word
      const wordEls = Array.from(words) as HTMLElement[];
      const target = wordEls[Math.floor(Math.random() * wordEls.length)];
      const translation = target.dataset.fluentifyTranslation;
      const original = target.dataset.fluentifyOriginal;
      if (!translation || !original) return;

      // Build distractor pool from frequency list
      const distractors = frequencyManager
        .entries()
        .map((e) => e.t.split('/')[0])
        .filter((t) => t.toLowerCase() !== original.toLowerCase());

      if (distractors.length < 3) return;

      const question = generateMultipleChoiceQuestion(
        `quiz:${translation}`,
        translation,
        original,
        distractors,
      );

      setQuiz(question);

      // Auto-dismiss after 30 seconds
      setTimeout(() => setQuiz(null), 30000);
    };

    // Check every 15 minutes (configurable via settings)
    quizIntervalRef.current = setInterval(showQuizIfReady, 15 * 60 * 1000);

    // Also try after 5 minutes initially
    const initialTimer = setTimeout(showQuizIfReady, 5 * 60 * 1000);

    return () => {
      if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
      clearTimeout(initialTimer);
    };
  }, [quiz]);

  const handleQuizAnswer = useCallback((_wordId: string, correct: boolean) => {
    // TODO: Phase 3 integration — update SRS based on quiz result
    console.log(`[Fluentify] Quiz answer: ${correct ? 'correct' : 'incorrect'}`);
  }, []);

  const handleQuizSnooze = useCallback(() => {
    snoozedUntilRef.current = Date.now() + 30 * 60 * 1000; // 30 min snooze
    setQuiz(null);
  }, []);

  return (
    <>
      {hoverData && <HoverCard data={hoverData} onDismiss={() => setHoverData(null)} />}
      {quiz && (
        <QuizToast
          question={quiz}
          onAnswer={handleQuizAnswer}
          onDismiss={() => setQuiz(null)}
          onSnooze={handleQuizSnooze}
        />
      )}
    </>
  );
}
