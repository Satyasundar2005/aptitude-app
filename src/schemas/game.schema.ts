import { z } from 'zod';

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ExamTrackSchema = z.enum(['all', 'gate', 'cat', 'gre', 'ese', 'placement', 'banking']);
export type ExamTrack = z.infer<typeof ExamTrackSchema>;

export const QuestionCategorySchema = z.enum([
  'arithmetic',
  'fractions',
  'percentages',
  'series',
  'logic',
  'algebra',
  'time_work',
  'speed_distance',
  'probability',
  'data_interpretation',
  'spatial_reasoning',
  'engineering_aptitude',
  'ethics_project_mgmt',
  'quantitative_comparison',
]);
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;

export const QuestionSchema = z
  .object({
    id: z.string().min(1, 'Question ID is required'),
    text: z.string().min(3, 'Question text must be at least 3 characters'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).min(2).max(6),
    correctIndex: z.number().int().min(0),
    category: QuestionCategorySchema,
    difficulty: DifficultySchema,
    timeLimit: z.number().positive().default(15),
    examTrack: ExamTrackSchema.optional(),
    examTag: z.string().optional(),
    explanation: z.string().optional(),
  })
  .refine((data) => data.correctIndex >= 0 && data.correctIndex < data.options.length, {
    message: 'correctIndex must be within the bounds of options array',
    path: ['correctIndex'],
  });
export type Question = z.infer<typeof QuestionSchema>;

export const PlayerStateSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  score: z.number().min(0).default(0),
  streak: z.number().min(0).default(0),
  multiplier: z.number().min(1).default(1),
  combo: z.number().min(0).default(0),
  answeredCorrect: z.boolean().nullable().default(null),
  lastAnswerTime: z.number().default(0),
});
export type PlayerState = z.infer<typeof PlayerStateSchema>;

export const GameModeSchema = z.enum(['online_duel', 'duel', 'solo_blitz', 'practice']);
export type GameMode = z.infer<typeof GameModeSchema>;

export const GamePhaseSchema = z.enum([
  'idle',
  'lobby',
  'countdown',
  'playing',
  'round_result',
  'game_over',
]);
export type GamePhase = z.infer<typeof GamePhaseSchema>;

export const OnlineRoomSchema = z.object({
  roomCode: z.string().length(6, 'Room code must be 6 digits'),
  isHost: z.boolean(),
  hostName: z.string().min(1),
  guestName: z.string().nullable().default(null),
  status: z.enum(['lobby', 'countdown', 'playing', 'game_over']),
  examTrack: ExamTrackSchema,
  difficulty: DifficultySchema,
  totalRounds: z.number().int().positive().default(5),
});
export type OnlineRoom = z.infer<typeof OnlineRoomSchema>;

export const MatchResultSchema = z.object({
  winnerId: z.number().nullable(),
  p1Score: z.number().min(0),
  p2Score: z.number().min(0),
  totalRounds: z.number().int().min(1),
  p1Correct: z.number().int().min(0),
  p2Correct: z.number().int().min(0),
  duration: z.number().min(0),
});
export type MatchResult = z.infer<typeof MatchResultSchema>;

export const BlitzAnswerRecordSchema = z.object({
  question: QuestionSchema,
  selectedOptionIndex: z.number().nullable(),
  isCorrect: z.boolean(),
  timeTaken: z.number().min(0),
});
export type BlitzAnswerRecord = z.infer<typeof BlitzAnswerRecordSchema>;

export const BlitzRunPayloadSchema = z.object({
  playerName: z.string().min(1),
  score: z.number().min(0),
  bestStreak: z.number().min(0),
  totalSolved: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  examTrack: ExamTrackSchema,
  difficulty: DifficultySchema,
  durationSeconds: z.number().positive().optional().default(60),
});
export type BlitzRunPayload = z.infer<typeof BlitzRunPayloadSchema>;
