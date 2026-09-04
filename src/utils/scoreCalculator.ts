/**
 * AptiClash Game Math & Scoring Engine
 */

export interface ScoreCalculationParams {
  baseScore?: number;
  timeRemaining: number;
  maxTime: number;
  streak: number;
  difficultyMultiplier?: number;
}

export interface ScoreResult {
  pointsAdded: number;
  timeBonus: number;
  multiplier: number;
  newStreak: number;
}

/**
 * Calculates streak multiplier:
 * Streak 0-1: 1.0x
 * Streak 2-3: 1.25x
 * Streak 4-6: 1.5x
 * Streak 7-9: 2.0x
 * Streak 10+: 2.5x (Max)
 */
export function getStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1.0;
  if (streak <= 3) return 1.25;
  if (streak <= 6) return 1.5;
  if (streak <= 9) return 2.0;
  return 2.5;
}

/**
 * Calculates rank title based on Elo rating
 */
export function getRankTitle(rating: number): string {
  if (rating < 1000) return 'Novice Aspirant';
  if (rating < 1200) return 'Bronze Scholar';
  if (rating < 1400) return 'Silver Tactician';
  if (rating < 1600) return 'Gold Strategist';
  if (rating < 1800) return 'Platinum Master';
  if (rating < 2000) return 'Diamond Prodigy';
  return 'Grandmaster Grandee';
}

/**
 * Calculates score for an answered question with time bonus and streak multiplier
 */
export function calculateScore(params: ScoreCalculationParams): ScoreResult {
  const {
    baseScore = 100,
    timeRemaining,
    maxTime,
    streak,
    difficultyMultiplier = 1.0,
  } = params;

  const validMaxTime = maxTime > 0 ? maxTime : 15;
  const clampedTimeRemaining = Math.max(0, Math.min(timeRemaining, validMaxTime));
  const timeRatio = clampedTimeRemaining / validMaxTime;
  
  // Time bonus is up to 50 additional points
  const timeBonus = Math.round(50 * timeRatio);
  const multiplier = getStreakMultiplier(streak + 1);

  const rawPoints = (baseScore + timeBonus) * multiplier * difficultyMultiplier;
  const pointsAdded = Math.round(rawPoints);

  return {
    pointsAdded,
    timeBonus,
    multiplier,
    newStreak: streak + 1,
  };
}

/**
 * Calculates accuracy percentage safely
 */
export function calculateAccuracy(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0 || correctCount <= 0) return 0;
  const percentage = (correctCount / totalQuestions) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
}

/**
 * Elo Rating adjustment calculator
 * K-Factor standard = 32
 */
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: 'win' | 'loss' | 'draw',
  kFactor = 32
): { newRating: number; ratingDelta: number } {
  const actualScore = result === 'win' ? 1.0 : result === 'draw' ? 0.5 : 0.0;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const ratingDelta = Math.round(kFactor * (actualScore - expectedScore));
  const newRating = Math.max(100, playerRating + ratingDelta);

  return {
    newRating,
    ratingDelta,
  };
}
