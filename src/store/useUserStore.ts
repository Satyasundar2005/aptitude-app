import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/safeStorage';
import { ExamTrack } from '../types/game';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  institution: string;
  targetExam: ExamTrack;
  rating: number;
  rankTitle: string;
  isLoggedIn: boolean;
  memberSince: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  timerAlerts: boolean;
  showPyqTags: boolean;
  dailyGoal: number;
  studyReminders: boolean;
}

interface UserStore {
  profile: UserProfile;
  settings: UserSettings;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  login: (name: string, email: string, institution?: string, targetExam?: ExamTrack) => void;
  logout: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Arjun Aspirant',
  email: 'arjun.aspirant@appticlash.io',
  avatar: '🎓',
  institution: 'IIT / NIT Aspirant',
  targetExam: 'gate',
  rating: 1280,
  rankTitle: 'Gold Scholar',
  isLoggedIn: true,
  memberSince: 'September 2026',
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  timerAlerts: true,
  showPyqTags: true,
  dailyGoal: 20,
  studyReminders: true,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,

      updateProfile: (updates) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...updates,
          },
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),

      login: (name, email, institution = 'Engineering Aspirant', targetExam = 'gate') =>
        set((state) => ({
          profile: {
            ...state.profile,
            name: name.trim() || 'Aspirant',
            email: email.trim() || 'aspirant@appticlash.io',
            institution: institution.trim() || 'Aspirant',
            targetExam,
            isLoggedIn: true,
          },
        })),

      logout: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            name: 'Guest Player',
            email: 'guest@appticlash.io',
            isLoggedIn: false,
          },
        })),
    }),
    {
      name: 'appticlash-user-store',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
