export type StageId =
  'foundation' | 'core_logic' | 'campus_placement' | 'banking_govt' | 'gate_ese' | 'cat_elite';

export interface ConceptHook {
  headline: string;
  intuition: string; // Plain-English explanation so a 13-year old immediately understands
  keyFormula?: string;
  mentalShortcut?: string;
  realWorldExample: string;
}

export interface StudyQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficultyNote?: string;
  examTag?: string; // e.g. "Age 13 Foundation", "TCS NQT 2024", "GATE 2023", "CAT 2024 Slot 1"
}

export interface StudyLevel {
  id: number; // 1 to 30
  stageId: StageId;
  stageNumber: number; // 1 to 6
  stageName: string;
  title: string;
  subtitle: string;
  gradeTag: string; // e.g. "GR 7-8 • FOUNDATION", "CAT 99%ILE"
  badgeColor: string;
  accentColor: string;
  gradientColors: [string, string];
  iconType: string;
  conceptHook: ConceptHook;
  questions: StudyQuestion[];
  xpReward: number;
}

export interface SoloStudyProgress {
  currentLevel: number;
  completedLevels: number[];
  levelStars: Record<number, number>; // 1, 2, or 3 stars
  totalXp: number;
  streak: number;
  viewMode: 'journey' | 'courses';
  activeCategory: string;
}
