export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Quality scale:
 * 5: Perfect, instant recall
 * 4: Correct, slight hesitation
 * 3: Correct, significant effort
 * 2: Incorrect, but felt familiar
 * 1: Incorrect, vaguely remembered
 * 0: Complete blackout
 */

export interface ReviewResult {
  wordId: string;
  quality: ReviewQuality;
  timestamp: number;
}
