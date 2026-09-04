import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/safeStorage';
import { ExamTrack } from '../types/game';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getCurrentUserProfile,
  updateDbProfile,
} from '../services/authService';

export interface UserProfile {
  id?: string;
  username?: string;
  name: string;
  email: string;
  avatar: string;
  institution: string;
  targetExam: ExamTrack;
  rating: number;
  rankTitle: string;
  isLoggedIn: boolean;
  memberSince: string;
  totalMatches?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  hasCompletedOnboarding?: boolean;
  referralCode?: string;
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
  isLoadingAuth: boolean;
  authError: string | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  login: (name: string, email: string, institution?: string, targetExam?: ExamTrack) => void;
  loginWithSupabase: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (
    email: string,
    password: string,
    name: string,
    targetExam?: ExamTrack
  ) => Promise<{
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  completeOnboarding: (name?: string, avatar?: string, targetExam?: ExamTrack) => void;
}

function getRankTitle(rating: number): string {
  if (rating >= 1800) return 'Grandmaster Scholar';
  if (rating >= 1600) return 'Diamond Master';
  if (rating >= 1400) return 'Platinum Aspirant';
  if (rating >= 1200) return 'Gold Scholar';
  if (rating >= 1000) return 'Silver Challenger';
  return 'Bronze Aspirant';
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Aspirant',
  email: 'aspirant@appticlash.io',
  avatar: '🎓',
  institution: 'GATE / CAT Aspirant',
  targetExam: 'gate',
  rating: 1200,
  rankTitle: 'Gold Scholar',
  isLoggedIn: false,
  memberSince: 'September 2026',
  totalMatches: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  hasCompletedOnboarding: false,
  referralCode: 'CLASH-2026',
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
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
      isLoadingAuth: false,
      authError: null,

      updateProfile: (updates) => {
        set((state) => {
          const newProfile = { ...state.profile, ...updates };
          // If rating changed, update rankTitle
          if (updates.rating !== undefined) {
            newProfile.rankTitle = getRankTitle(updates.rating);
          }
          return { profile: newProfile };
        });

        // Sync to Supabase if logged in
        const current = get().profile;
        if (current.id && !current.id.startsWith('mock_')) {
          updateDbProfile(current.id, {
            display_name: current.name,
            exam_track: current.targetExam,
            avatar_url: current.avatar,
          }).catch(console.error);
        }
      },

      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),

      // Local / Offline fallback login
      login: (name, email, institution = 'Engineering Aspirant', targetExam = 'gate') =>
        set((state) => ({
          profile: {
            ...state.profile,
            name: name.trim() || 'Aspirant',
            email: email.trim() || 'aspirant@appticlash.io',
            institution: institution.trim() || 'Aspirant',
            targetExam,
            isLoggedIn: true,
            hasCompletedOnboarding: true,
          },
        })),

      completeOnboarding: (name, avatar, targetExam) =>
        set((state) => ({
          profile: {
            ...state.profile,
            name: name?.trim() || state.profile.name,
            avatar: avatar || state.profile.avatar,
            targetExam: targetExam || state.profile.targetExam,
            hasCompletedOnboarding: true,
          },
        })),

      // Supabase Email & Password Login
      loginWithSupabase: async (email, password) => {
        set({ isLoadingAuth: true, authError: null });
        const res = await signInWithEmail(email, password);
        set({ isLoadingAuth: false });

        if (!res.success || !res.profile) {
          const errMsg = res.error || 'Login failed. Check your credentials.';
          set({ authError: errMsg });
          return { success: false, error: errMsg };
        }

        const p = res.profile;
        set((state) => ({
          authError: null,
          profile: {
            ...state.profile,
            id: p.id,
            username: p.username,
            name: p.displayName || p.username,
            email: p.email || email,
            targetExam: p.examTrack,
            rating: p.ratingElo,
            rankTitle: getRankTitle(p.ratingElo),
            totalMatches: p.totalMatches,
            wins: p.wins,
            losses: p.losses,
            draws: p.draws,
            isLoggedIn: true,
          },
        }));

        return { success: true };
      },

      // Supabase Email & Password Sign Up
      signUpWithSupabase: async (email, password, name, targetExam = 'gate') => {
        set({ isLoadingAuth: true, authError: null });
        const res = await signUpWithEmail(email, password, name, targetExam);
        set({ isLoadingAuth: false });

        if (!res.success || !res.profile) {
          const errMsg = res.error || 'Sign up failed. Please try again.';
          set({ authError: errMsg });
          return { success: false, error: errMsg };
        }

        const p = res.profile;
        set((state) => ({
          authError: null,
          profile: {
            ...state.profile,
            id: p.id,
            username: p.username,
            name: p.displayName || name,
            email: p.email || email,
            targetExam: p.examTrack || targetExam,
            rating: p.ratingElo,
            rankTitle: getRankTitle(p.ratingElo),
            totalMatches: p.totalMatches,
            wins: p.wins,
            losses: p.losses,
            draws: p.draws,
            isLoggedIn: !res.requiresEmailConfirmation,
          },
        }));

        return {
          success: true,
          requiresEmailConfirmation: res.requiresEmailConfirmation,
          message: res.message,
        };
      },

      // Supabase Sign Out
      logout: async () => {
        set({ isLoadingAuth: true });
        await signOutUser();
        set({
          isLoadingAuth: false,
          authError: null,
          profile: {
            ...DEFAULT_PROFILE,
            isLoggedIn: false,
            name: 'Guest Player',
            email: 'guest@appticlash.io',
          },
        });
      },

      // Auto check active Supabase session on app launch
      initAuth: async () => {
        try {
          const p = await getCurrentUserProfile();
          if (p) {
            set((state) => ({
              profile: {
                ...state.profile,
                id: p.id,
                username: p.username,
                name: p.displayName || p.username,
                email: p.email,
                targetExam: p.examTrack,
                rating: p.ratingElo,
                rankTitle: getRankTitle(p.ratingElo),
                totalMatches: p.totalMatches,
                wins: p.wins,
                losses: p.losses,
                draws: p.draws,
                isLoggedIn: true,
              },
            }));
          }
        } catch (err) {
          console.warn('[UserStore] Could not restore auth session:', err);
        }
      },
    }),
    {
      name: 'appticlash-user-store',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
