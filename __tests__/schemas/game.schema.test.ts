import {
  QuestionSchema,
  OnlineRoomSchema,
  MatchResultSchema,
  BlitzRunPayloadSchema,
} from '../../src/schemas/game.schema';

describe('Game Zod Schemas', () => {
  describe('QuestionSchema', () => {
    it('validates a well-formed Question object', () => {
      const validQuestion = {
        id: 'q_test_1',
        text: 'What is 15 * 12?',
        options: ['160', '180', '190', '175'],
        correctIndex: 1,
        category: 'arithmetic',
        difficulty: 'easy',
        timeLimit: 15,
        examTrack: 'gate',
        explanation: '15 * 12 = 180',
      };

      const result = QuestionSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.options[result.data.correctIndex]).toBe('180');
      }
    });

    it('rejects questions with out-of-bounds correctIndex', () => {
      const invalidQuestion = {
        id: 'q_test_2',
        text: 'What is 2 + 2?',
        options: ['3', '4'],
        correctIndex: 5, // out of bounds!
        category: 'arithmetic',
        difficulty: 'easy',
        timeLimit: 15,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('rejects questions with fewer than 2 options', () => {
      const invalidQuestion = {
        id: 'q_test_3',
        text: 'Invalid Question?',
        options: ['Only One Option'],
        correctIndex: 0,
        category: 'logic',
        difficulty: 'easy',
        timeLimit: 15,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('rejects questions with empty text', () => {
      const invalidQuestion = {
        id: 'q_test_4',
        text: '  ',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        category: 'fractions',
        difficulty: 'easy',
        timeLimit: 15,
      };

      const result = QuestionSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });
  });

  describe('OnlineRoomSchema', () => {
    it('accepts valid 6-digit room codes', () => {
      const validRoom = {
        roomCode: '748291',
        isHost: true,
        hostName: 'TestHost',
        guestName: null,
        status: 'lobby',
        examTrack: 'gate',
        difficulty: 'medium',
        totalRounds: 5,
      };

      const result = OnlineRoomSchema.safeParse(validRoom);
      expect(result.success).toBe(true);
    });

    it('rejects invalid room codes', () => {
      const invalidRoom = {
        roomCode: '123', // too short
        isHost: true,
        hostName: 'TestHost',
        guestName: null,
        status: 'lobby',
        examTrack: 'gate',
        difficulty: 'medium',
        totalRounds: 5,
      };

      const result = OnlineRoomSchema.safeParse(invalidRoom);
      expect(result.success).toBe(false);
    });
  });

  describe('MatchResultSchema', () => {
    it('validates completed match result statistics', () => {
      const validResult = {
        winnerId: 1,
        p1Score: 450,
        p2Score: 320,
        totalRounds: 5,
        p1Correct: 4,
        p2Correct: 3,
        duration: 72,
      };

      const result = MatchResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });
  });

  describe('BlitzRunPayloadSchema', () => {
    it('validates solo blitz submission data', () => {
      const validPayload = {
        playerName: 'BlitzRunner',
        score: 1250,
        bestStreak: 8,
        totalSolved: 14,
        accuracy: 87.5,
        examTrack: 'placement',
        difficulty: 'easy',
        durationSeconds: 60,
      };

      const result = BlitzRunPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid accuracy above 100', () => {
      const invalidPayload = {
        playerName: 'Cheater',
        score: 9999,
        bestStreak: 10,
        totalSolved: 10,
        accuracy: 150, // invalid percentage
        examTrack: 'cat',
        difficulty: 'hard',
      };

      const result = BlitzRunPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
