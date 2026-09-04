import { supabase, isSupabaseConfigured } from './supabase';
import { ExamTrack } from '../types/game';

export interface AuthProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  examTrack: ExamTrack;
  ratingElo: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  bestStreak: number;
  totalSolved: number;
}

export interface AuthResponse {
  success: boolean;
  profile?: AuthProfile;
  error?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  examTrack: ExamTrack = 'gate'
): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      profile: {
        id: `mock_${Date.now()}`,
        email,
        username: email.split('@')[0],
        displayName: fullName || 'Aspirant',
        examTrack,
        ratingElo: 1200,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        bestStreak: 0,
        totalSolved: 0,
      },
    };
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0];
    const username = cleanEmail.split('@')[0] + '_' + Math.floor(100 + Math.random() * 900);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          username,
          exam_track: examTrack,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    if (!user) {
      return { success: false, error: 'User registration failed. Please try again.' };
    }

    // Wait 500ms for Postgres trigger to create public.profiles row, then fetch
    await new Promise((resolve) => setTimeout(resolve, 600));

    let profile = await fetchProfileById(user.id);

    // If trigger did not run, create profile directly
    if (!profile) {
      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          display_name: cleanName,
          exam_track: examTrack,
          rating_elo: 1200,
        })
        .select()
        .single();

      if (!insertErr && inserted) {
        profile = mapDbProfileToAuthProfile(inserted, cleanEmail);
      }
    }

    const isConfirmed = Boolean(data.session);

    return {
      success: true,
      requiresEmailConfirmation: !isConfirmed,
      message: !isConfirmed
        ? 'Account registered! Please check your email to confirm your account, or disable "Confirm email" in Supabase Auth settings for instant login.'
        : undefined,
      profile: profile || {
        id: user.id,
        email: cleanEmail,
        username,
        displayName: cleanName,
        examTrack,
        ratingElo: 1200,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        bestStreak: 0,
        totalSolved: 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected sign-up error occurred.' };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      profile: {
        id: `mock_${Date.now()}`,
        email,
        username: email.split('@')[0],
        displayName: 'Aspirant',
        examTrack: 'gate',
        ratingElo: 1280,
        totalMatches: 4,
        wins: 3,
        losses: 1,
        draws: 0,
        bestStreak: 5,
        totalSolved: 14,
      },
    };
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    if (!user) {
      return { success: false, error: 'Unable to sign in. Please verify your credentials.' };
    }

    const profile = await fetchProfileById(user.id);

    return {
      success: true,
      profile: profile || {
        id: user.id,
        email: user.email || cleanEmail,
        username: cleanEmail.split('@')[0],
        displayName: user.user_metadata?.full_name || 'Aspirant',
        examTrack: (user.user_metadata?.exam_track as ExamTrack) || 'gate',
        ratingElo: 1200,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        bestStreak: 0,
        totalSolved: 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected sign-in error occurred.' };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error logging out.' };
  }
}

/**
 * Fetch profile by User ID from Supabase profiles table
 */
export async function fetchProfileById(userId: string): Promise<AuthProfile | null> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error || !data) {
      return null;
    }

    return mapDbProfileToAuthProfile(data);
  } catch {
    return null;
  }
}

/**
 * Get current active session user profile
 */
export async function getCurrentUserProfile(): Promise<AuthProfile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const profile = await fetchProfileById(user.id);
    if (profile) return profile;

    return {
      id: user.id,
      email: user.email || '',
      username: user.email?.split('@')[0] || 'User',
      displayName: user.user_metadata?.full_name || 'Aspirant',
      examTrack: (user.user_metadata?.exam_track as ExamTrack) || 'gate',
      ratingElo: 1200,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      bestStreak: 0,
      totalSolved: 0,
    };
  } catch {
    return null;
  }
}

/**
 * Update user profile in Supabase profiles table
 */
export async function updateDbProfile(
  userId: string,
  updates: {
    display_name?: string;
    avatar_url?: string;
    exam_track?: string;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}

function mapDbProfileToAuthProfile(row: any, fallbackEmail = ''): AuthProfile {
  return {
    id: row.id,
    email: fallbackEmail,
    username: row.username || 'User',
    displayName: row.display_name || row.username || 'Aspirant',
    avatarUrl: row.avatar_url || undefined,
    examTrack: (row.exam_track as ExamTrack) || 'gate',
    ratingElo: row.rating_elo ?? 1200,
    totalMatches: row.total_matches ?? 0,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    draws: row.draws ?? 0,
    bestStreak: row.best_streak ?? 0,
    totalSolved: row.total_solved ?? 0,
  };
}
