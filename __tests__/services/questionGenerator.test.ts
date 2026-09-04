import { generateQuestion, getTimeLimit } from '../../src/services/questionGenerator';
import { QuestionSchema } from '../../src/schemas/game.schema';
import { Difficulty, ExamTrack } from '../../src/types/game';

describe('questionGenerator service', () => {
  describe('getTimeLimit', () => {
    it('returns appropriate time limits for each difficulty', () => {
      expect(getTimeLimit('easy')).toBe(60);
      expect(getTimeLimit('medium')).toBe(45);
      expect(getTimeLimit('hard')).toBe(30);
    });
  });

  describe('generateQuestion', () => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const tracks: ExamTrack[] = ['gate', 'cat', 'placement', 'all'];

    difficulties.forEach((diff) => {
      tracks.forEach((track) => {
        it(`generates a valid schema-compliant question for difficulty="${diff}" and track="${track}"`, () => {
          const q = generateQuestion(diff, track);

          // 1. Zod schema validation
          const parseResult = QuestionSchema.safeParse(q);
          expect(parseResult.success).toBe(true);

          // 2. Options validation
          expect(q.options).toHaveLength(4);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(4);

          // 3. Question text and answer exist
          expect(q.text.trim().length).toBeGreaterThan(0);
          const correctAnswer = q.options[q.correctIndex];
          expect(correctAnswer).toBeDefined();
          expect(correctAnswer.length).toBeGreaterThan(0);

          // 4. Time limit matches or is positive
          expect(q.timeLimit).toBeGreaterThan(0);
        });
      });
    });

    it('generates 20 successive questions without corruption', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion('medium', 'gate');
        const validation = QuestionSchema.safeParse(q);
        expect(validation.success).toBe(true);
        expect(q.options[q.correctIndex]).toBeDefined();
      }
    });
  });
});
