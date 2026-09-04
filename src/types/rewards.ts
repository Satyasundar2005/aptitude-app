export type MatchFormat = 'online' | 'duel' | 'blitz' | 'study';

export type MatchOutcome = 'win' | 'loss' | 'draw';

export interface PointsChangeResult {
  delta: number;
  newPoints: number;
  format: MatchFormat;
  outcome: MatchOutcome;
  reason: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  points: number;
  claimed: boolean;
  icon: string;
  formatTag: string;
}

export interface RewardsHistoryEntry {
  id: string;
  timestamp: number;
  format: MatchFormat | 'daily_task' | 'daily_bonus';
  delta: number;
  description: string;
}

export interface DailyRewardsState {
  dateKey: string; // 'YYYY-MM-DD'
  tasks: DailyTask[];
  bonusChestClaimed: boolean;
  recentHistory: RewardsHistoryEntry[];
}
