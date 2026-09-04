import {
  getStreakMultiplier,
  getRankTitle,
  calculateScore,
  calculateAccuracy,
  calculateEloChange,
} from '../../src/utils/scoreCalculator';

describe('scoreCalculator utilities', () => {
  describe('getStreakMultiplier', () => {
    it('returns 1.0x for streaks 0 and 1', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(1)).toBe(1.0);
    });

    it('returns 1.25x for streaks 2 and 3', () => {
      expect(getStreakMultiplier(2)).toBe(1.25);
      expect(getStreakMultiplier(3)).toBe(1.25);
    });

    it('returns 1.5x for streaks 4 through 6', () => {
      expect(getStreakMultiplier(4)).toBe(1.5);
      expect(getStreakMultiplier(6)).toBe(1.5);
    });

    it('returns 2.0x for streaks 7 through 9', () => {
      expect(getStreakMultiplier(7)).toBe(2.0);
      expect(getStreakMultiplier(9)).toBe(2.0);
    });

    it('caps at 2.5x for streaks 10 and above', () => {
      expect(getStreakMultiplier(10)).toBe(2.5);
      expect(getStreakMultiplier(25)).toBe(2.5);
    });
  });

  describe('getRankTitle', () => {
    it('returns correct titles across rating brackets', () => {
      expect(getRankTitle(850)).toBe('Novice Aspirant');
      expect(getRankTitle(1100)).toBe('Bronze Scholar');
      expect(getRankTitle(1350)).toBe('Silver Tactician');
      expect(getRankTitle(1550)).toBe('Gold Strategist');
      expect(getRankTitle(1750)).toBe('Platinum Master');
      expect(getRankTitle(1950)).toBe('Diamond Prodigy');
      expect(getRankTitle(2200)).toBe('Grandmaster Grandee');
    });
  });

  describe('calculateScore', () => {
    it('calculates score with base points and max time bonus', () => {
      const result = calculateScore({
        baseScore: 100,
        timeRemaining: 15,
        maxTime: 15,
        streak: 0,
      });

      // (100 base + 50 time bonus) * 1.0 = 150
      expect(result.pointsAdded).toBe(150);
      expect(result.timeBonus).toBe(50);
      expect(result.multiplier).toBe(1.0);
      expect(result.newStreak).toBe(1);
    });

    it('applies streak multiplier correctly on consecutive answers', () => {
      const result = calculateScore({
        baseScore: 100,
        timeRemaining: 0,
        maxTime: 15,
        streak: 3, // next streak = 4 -> 1.5x
      });

      // (100 base + 0 time bonus) * 1.5 = 150
      expect(result.pointsAdded).toBe(150);
      expect(result.multiplier).toBe(1.5);
      expect(result.newStreak).toBe(4);
    });

    it('clamps negative or excessive remaining time', () => {
      const negativeTime = calculateScore({
        baseScore: 100,
        timeRemaining: -5,
        maxTime: 15,
        streak: 0,
      });
      expect(negativeTime.timeBonus).toBe(0);

      const excessiveTime = calculateScore({
        baseScore: 100,
        timeRemaining: 30,
        maxTime: 15,
        streak: 0,
      });
      expect(excessiveTime.timeBonus).toBe(50);
    });
  });

  describe('calculateAccuracy', () => {
    it('returns 0 when total questions is 0', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it('returns 100 when all questions are correct', () => {
      expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it('rounds to one decimal place', () => {
      expect(calculateAccuracy(1, 3)).toBe(33.3);
      expect(calculateAccuracy(7, 9)).toBe(77.8);
    });
  });

  describe('calculateEloChange', () => {
    it('grants positive delta on victory', () => {
      const { newRating, ratingDelta } = calculateEloChange(1200, 1200, 'win');
      expect(ratingDelta).toBe(16);
      expect(newRating).toBe(1216);
    });

    it('grants greater delta when beating a higher-rated opponent', () => {
      const againstEqual = calculateEloChange(1200, 1200, 'win');
      const againstHigher = calculateEloChange(1200, 1400, 'win');
      expect(againstHigher.ratingDelta).toBeGreaterThan(againstEqual.ratingDelta);
    });

    it('reduces rating on loss', () => {
      const { newRating, ratingDelta } = calculateEloChange(1200, 1200, 'loss');
      expect(ratingDelta).toBe(-16);
      expect(newRating).toBe(1184);
    });

    it('never drops below minimum threshold of 100', () => {
      const { newRating } = calculateEloChange(105, 2000, 'loss');
      expect(newRating).toBeGreaterThanOrEqual(100);
    });
  });
});
