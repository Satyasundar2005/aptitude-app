import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/safeStorage';
import {
  MatchFormat,
  MatchOutcome,
  PointsChangeResult,
  DailyTask,
  RewardsHistoryEntry,
} from '../types/rewards';
import { useUserStore } from './useUserStore';

export const POINTS_RULES = {
  online: { win: 35, loss: -25, draw: 5 },
  duel: { win: 30, loss: -20, draw: 5 },
  blitz: { win: 25, loss: -15, draw: 0 },
  study: { win: 20, loss: -10, draw: 0 },
  bonusChest: 75,
};

const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_TASKS: DailyTask[] = [
  {
    id: 'daily_login',
    title: 'Daily Training Check-in',
    description: 'Open AptiClash and complete at least one round or lesson today.',
    target: 1,
    current: 1, // Granted on opening/initiating
    points: 20,
    claimed: false,
    icon: 'calendar',
    formatTag: 'Daily',
  },
  {
    id: 'duel_win',
    title: 'Duel Champion',
    description: 'Win 1 battle in Online 1v1 or Split-Screen Duel.',
    target: 1,
    current: 0,
    points: 35,
    claimed: false,
    icon: 'swords',
    formatTag: 'Duel / Online',
  },
  {
    id: 'blitz_sprint',
    title: 'Speed Sprint Master',
    description: 'Complete 1 timed exam sprint in Solo Blitz mode.',
    target: 1,
    current: 0,
    points: 30,
    claimed: false,
    icon: 'zap',
    formatTag: 'Solo Blitz',
  },
  {
    id: 'study_levels',
    title: 'Curriculum Scholar',
    description: 'Complete 2 Solo Study levels with 2+ stars.',
    target: 2,
    current: 0,
    points: 40,
    claimed: false,
    icon: 'book',
    formatTag: 'Solo Study',
  },
  {
    id: 'accuracy_shots',
    title: 'Precision Sharpshooter',
    description: 'Answer 5 questions correctly across any game format.',
    target: 5,
    current: 0,
    points: 30,
    claimed: false,
    icon: 'target',
    formatTag: 'All Formats',
  },
];

interface RewardsStoreState {
  dateKey: string;
  tasks: DailyTask[];
  bonusChestClaimed: boolean;
  history: RewardsHistoryEntry[];
  totalPointsEarned: number;
  totalPointsLost: number;

  // Actions
  checkDailyReset: () => void;
  recordMatchOutcome: (
    format: MatchFormat,
    outcome: MatchOutcome,
    details?: { correctCount?: number; description?: string }
  ) => PointsChangeResult;
  claimTask: (taskId: string) => number;
  claimBonusChest: () => number;
  getClaimableCount: () => number;
  isBonusChestEligible: () => boolean;
}

export const useRewardsStore = create<RewardsStoreState>()(
  persist(
    (set, get) => ({
      dateKey: getTodayKey(),
      tasks: INITIAL_TASKS,
      bonusChestClaimed: false,
      history: [],
      totalPointsEarned: 0,
      totalPointsLost: 0,

      checkDailyReset: () => {
        const today = getTodayKey();
        const current = get().dateKey;
        if (current !== today) {
          set({
            dateKey: today,
            tasks: INITIAL_TASKS.map((t) => ({
              ...t,
              current: t.id === 'daily_login' ? 1 : 0,
              claimed: false,
            })),
            bonusChestClaimed: false,
          });
        }
      },

      recordMatchOutcome: (format, outcome, details) => {
        get().checkDailyReset();

        // Calculate points delta
        const rule = POINTS_RULES[format];
        const delta = outcome === 'win' ? rule.win : outcome === 'loss' ? rule.loss : rule.draw;

        // Update User Profile rating/points
        const userStore = useUserStore.getState();
        const currentRating = userStore.profile.rating || 1200;
        const newRating = Math.max(0, currentRating + delta);

        const currentMatches = userStore.profile.totalMatches || 0;
        const currentWins = userStore.profile.wins || 0;
        const currentLosses = userStore.profile.losses || 0;
        const currentDraws = userStore.profile.draws || 0;

        userStore.updateProfile({
          rating: newRating,
          totalMatches: currentMatches + 1,
          wins: outcome === 'win' ? currentWins + 1 : currentWins,
          losses: outcome === 'loss' ? currentLosses + 1 : currentLosses,
          draws: outcome === 'draw' ? currentDraws + 1 : currentDraws,
        });

        // Advance daily tasks
        const state = get();
        const updatedTasks = state.tasks.map((task) => {
          let inc = 0;
          if (
            task.id === 'duel_win' &&
            outcome === 'win' &&
            (format === 'duel' || format === 'online')
          ) {
            inc = 1;
          } else if (task.id === 'blitz_sprint' && format === 'blitz') {
            inc = 1;
          } else if (task.id === 'study_levels' && format === 'study' && outcome === 'win') {
            inc = 1;
          } else if (task.id === 'accuracy_shots' && details?.correctCount) {
            inc = details.correctCount;
          }

          if (inc > 0) {
            return {
              ...task,
              current: Math.min(task.target, task.current + inc),
            };
          }
          return task;
        });

        // Add history entry
        const historyEntry: RewardsHistoryEntry = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          format,
          delta,
          description:
            details?.description ||
            `${format.toUpperCase()} ${outcome.toUpperCase()} (${delta > 0 ? `+${delta}` : delta} pts)`,
        };

        set({
          tasks: updatedTasks,
          history: [historyEntry, ...state.history.slice(0, 49)],
          totalPointsEarned: delta > 0 ? state.totalPointsEarned + delta : state.totalPointsEarned,
          totalPointsLost:
            delta < 0 ? state.totalPointsLost + Math.abs(delta) : state.totalPointsLost,
        });

        return {
          delta,
          newPoints: newRating,
          format,
          outcome,
          reason: historyEntry.description,
        };
      },

      claimTask: (taskId: string) => {
        get().checkDailyReset();
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || task.claimed || task.current < task.target) {
          return 0;
        }

        // Add points to User Profile
        const userStore = useUserStore.getState();
        const currentRating = userStore.profile.rating || 1200;
        const newRating = currentRating + task.points;
        userStore.updateProfile({ rating: newRating });

        const updatedTasks = state.tasks.map((t) =>
          t.id === taskId ? { ...t, claimed: true } : t
        );

        const historyEntry: RewardsHistoryEntry = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          format: 'daily_task',
          delta: task.points,
          description: `Daily Quest: ${task.title} (+${task.points} pts)`,
        };

        set({
          tasks: updatedTasks,
          history: [historyEntry, ...state.history.slice(0, 49)],
          totalPointsEarned: state.totalPointsEarned + task.points,
        });

        return task.points;
      },

      claimBonusChest: () => {
        get().checkDailyReset();
        const state = get();
        if (state.bonusChestClaimed) return 0;
        const allCompleted = state.tasks.every((t) => t.current >= t.target);
        if (!allCompleted) return 0;

        const bonusPoints = POINTS_RULES.bonusChest;
        const userStore = useUserStore.getState();
        const currentRating = userStore.profile.rating || 1200;
        userStore.updateProfile({ rating: currentRating + bonusPoints });

        const historyEntry: RewardsHistoryEntry = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          format: 'daily_bonus',
          delta: bonusPoints,
          description: `Daily Crown Chest Completed (+${bonusPoints} pts)`,
        };

        set({
          bonusChestClaimed: true,
          history: [historyEntry, ...state.history.slice(0, 49)],
          totalPointsEarned: state.totalPointsEarned + bonusPoints,
        });

        return bonusPoints;
      },

      getClaimableCount: () => {
        get().checkDailyReset();
        const state = get();
        let count = state.tasks.filter((t) => !t.claimed && t.current >= t.target).length;
        if (!state.bonusChestClaimed && state.tasks.every((t) => t.current >= t.target)) {
          count += 1;
        }
        return count;
      },

      isBonusChestEligible: () => {
        const state = get();
        return !state.bonusChestClaimed && state.tasks.every((t) => t.current >= t.target);
      },
    }),
    {
      name: 'appticlash-rewards-store',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
