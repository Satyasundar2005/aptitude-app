import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/safeStorage';
import { SoloStudyProgress, StageId } from '../types/soloStudy';

interface SoloStudyActions {
  completeLevel: (levelId: number, stars: number, xpEarned: number) => void;
  setCurrentLevel: (levelId: number) => void;
  setViewMode: (mode: 'journey' | 'courses') => void;
  setActiveCategory: (category: string) => void;
  resetProgress: () => void;
}

export type SoloStudyStore = SoloStudyProgress & SoloStudyActions;

const DEFAULT_PROGRESS: SoloStudyProgress = {
  currentLevel: 1,
  completedLevels: [],
  levelStars: {},
  totalXp: 0,
  streak: 1,
  viewMode: 'journey',
  activeCategory: 'all',
};

export const useSoloStudyStore = create<SoloStudyStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,

      completeLevel: (levelId: number, stars: number, xpEarned: number) => {
        set((state) => {
          const completedSet = new Set(state.completedLevels);
          const isFirstTime = !completedSet.has(levelId);
          completedSet.add(levelId);

          const currentStars = state.levelStars[levelId] || 0;
          const bestStars = Math.max(currentStars, stars);

          // Advance to next level if current was completed
          const nextLevel = Math.min(30, Math.max(state.currentLevel, levelId + 1));

          return {
            completedLevels: Array.from(completedSet),
            levelStars: {
              ...state.levelStars,
              [levelId]: bestStars,
            },
            totalXp: state.totalXp + (isFirstTime ? xpEarned : Math.round(xpEarned * 0.3)),
            currentLevel: nextLevel,
            streak: Math.max(state.streak, 1),
          };
        });
      },

      setCurrentLevel: (levelId: number) => {
        set({ currentLevel: Math.max(1, Math.min(30, levelId)) });
      },

      setViewMode: (mode: 'journey' | 'courses') => {
        set({ viewMode: mode });
      },

      setActiveCategory: (category: string) => {
        set({ activeCategory: category });
      },

      resetProgress: () => {
        set({ ...DEFAULT_PROGRESS });
      },
    }),
    {
      name: 'appticlash-solo-study-store',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
