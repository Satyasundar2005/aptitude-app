export type Difficulty = 'easy' | 'medium' | 'hard';

export type ExamTrack = 'all' | 'gate' | 'cat' | 'gre' | 'ese' | 'placement' | 'banking';

export type QuestionCategory =
  | 'arithmetic'
  | 'fractions'
  | 'percentages'
  | 'series'
  | 'logic'
  | 'algebra'
  | 'time_work'
  | 'speed_distance'
  | 'probability'
  | 'data_interpretation'
  | 'spatial_reasoning'
  | 'engineering_aptitude'
  | 'ethics_project_mgmt'
  | 'quantitative_comparison';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  category: QuestionCategory;
  difficulty: Difficulty;
  timeLimit: number;
  examTrack?: ExamTrack;
  examTag?: string; // e.g. "GATE CS 2023", "CAT 2022", "GRE Quant", "ESE 2023 Paper-1", "TCS NQT"
  explanation?: string;
}

export interface PlayerState {
  id: number;
  name: string;
  score: number;
  streak: number;
  multiplier: number;
  combo: number;
  answeredCorrect: boolean | null;
  lastAnswerTime: number;
}

export type GameMode = 'online_duel' | 'duel' | 'solo_blitz' | 'practice';

export type GamePhase = 'idle' | 'lobby' | 'countdown' | 'playing' | 'round_result' | 'game_over';

export interface OnlineRoom {
  roomCode: string;
  isHost: boolean;
  hostName: string;
  guestName: string | null;
  status: 'lobby' | 'countdown' | 'playing' | 'game_over';
  examTrack: ExamTrack;
  difficulty: Difficulty;
  totalRounds: number;
}

export interface BlitzAnswerRecord {
  question: Question;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  timeTaken: number;
}

export interface MatchResult {
  winnerId: number | null;
  p1Score: number;
  p2Score: number;
  totalRounds: number;
  p1Correct: number;
  p2Correct: number;
  duration: number;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  difficulty: Difficulty;
  examTrack: ExamTrack;
  timer: number;
  maxTime: number;
  maxScore: number;
  currentQuestion: Question | null;
  player1: PlayerState;
  player2: PlayerState;
  onlineRoom: OnlineRoom | null;
  result: MatchResult | null;
  roundNumber: number;
  totalRounds: number;
  totalSolved: number;
  bestStreak: number;
  blitzHistory: BlitzAnswerRecord[];
}
