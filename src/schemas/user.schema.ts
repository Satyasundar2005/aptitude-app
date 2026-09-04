import { z } from 'zod';
import { ExamTrackSchema } from './game.schema';

export const UserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email address'),
  avatar: z.string().default('🎓'),
  institution: z.string().default('Aspirant'),
  targetExam: ExamTrackSchema.default('gate'),
  rating: z.number().int().min(0).default(1200),
  rankTitle: z.string().default('Bronze Scholar'),
  isLoggedIn: z.boolean().default(false),
  memberSince: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserSettingsSchema = z.object({
  soundEnabled: z.boolean().default(true),
  hapticsEnabled: z.boolean().default(true),
  timerAlerts: z.boolean().default(true),
  showPyqTags: z.boolean().default(true),
  dailyGoal: z.number().int().positive().max(200).default(20),
  studyReminders: z.boolean().default(true),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const LoginPayloadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  institution: z.string().trim().optional().default('Engineering Aspirant'),
  targetExam: ExamTrackSchema.optional().default('gate'),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const UpdateProfileSchema = UserProfileSchema.partial();
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
