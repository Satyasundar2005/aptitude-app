import {
  UserProfileSchema,
  UserSettingsSchema,
  LoginPayloadSchema,
} from '../../src/schemas/user.schema';

describe('User Zod Schemas', () => {
  describe('UserProfileSchema', () => {
    it('validates a complete user profile', () => {
      const validProfile = {
        name: 'Satyasundar',
        email: 'satya@example.com',
        avatar: '🚀',
        institution: 'NIT Rourkela',
        targetExam: 'gate',
        rating: 1450,
        rankTitle: 'Silver Tactician',
        isLoggedIn: true,
        memberSince: 'September 2026',
      };

      const result = UserProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('rejects malformed email addresses', () => {
      const invalidProfile = {
        name: 'Invalid Email User',
        email: 'not-an-email',
        avatar: '🎓',
        institution: 'Test Institute',
        targetExam: 'gate',
        rating: 1200,
        rankTitle: 'Bronze Scholar',
        isLoggedIn: false,
        memberSince: 'September 2026',
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('UserSettingsSchema', () => {
    it('populates defaults for empty settings object', () => {
      const result = UserSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.soundEnabled).toBe(true);
        expect(result.data.hapticsEnabled).toBe(true);
        expect(result.data.dailyGoal).toBe(20);
      }
    });

    it('rejects negative daily goal values', () => {
      const result = UserSettingsSchema.safeParse({ dailyGoal: -5 });
      expect(result.success).toBe(false);
    });
  });

  describe('LoginPayloadSchema', () => {
    it('trims whitespace and validates login credentials', () => {
      const payload = {
        name: '  Ananya  ',
        email: 'ananya@study.edu',
        targetExam: 'cat',
      };

      const result = LoginPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Ananya');
        expect(result.data.targetExam).toBe('cat');
      }
    });
  });
});
