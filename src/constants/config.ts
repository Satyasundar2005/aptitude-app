/**
 * AptiClash Game Configuration & Rules
 */

export const GAME_CONFIG = {
  // Solo Blitz
  SOLO_BLITZ_DURATION_SECONDS: 60,
  SOLO_BLITZ_BASE_POINTS: 100,

  // Duel Mode
  DUEL_DEFAULT_ROUNDS: 5,
  DUEL_MAX_ROUNDS: 15,
  DUEL_ROUND_TIME_LIMIT: 15, // seconds

  // Streak Multipliers
  STREAK_TIERS: [
    { minStreak: 10, multiplier: 2.5, name: 'GODLIKE' },
    { minStreak: 7, multiplier: 2.0, name: 'RAMPAGE' },
    { minStreak: 4, multiplier: 1.5, name: 'ON FIRE' },
    { minStreak: 2, multiplier: 1.25, name: 'HEATING UP' },
    { minStreak: 0, multiplier: 1.0, name: 'NORMAL' },
  ],

  // Rating & Matchmaking
  DEFAULT_ELO: 1200,
  ELO_K_FACTOR: 32,

  // Local Storage Keys
  STORAGE_KEYS: {
    USER_STORE: 'appticlash-user-store',
    GAME_STORE: 'appticlash-game-store',
    HIGH_SCORES: 'appticlash-high-scores',
  },
};
