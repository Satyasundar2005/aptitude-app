import { supabase, isSupabaseConfigured } from './supabase';
import { Difficulty, ExamTrack, Question } from '../types/game';
import { generateQuestion } from './questionGenerator';

export interface RoomRecord {
  id: string;
  room_code: string;
  status: 'lobby' | 'countdown' | 'playing' | 'round_result' | 'game_over' | 'abandoned';
  exam_track: ExamTrack;
  difficulty: Difficulty;
  total_rounds: number;
  current_round: number;
  host_id: string;
  host_name: string;
  host_score: number;
  host_streak: number;
  host_ready: boolean;
  guest_id: string | null;
  guest_name: string | null;
  guest_score: number;
  guest_streak: number;
  guest_ready: boolean;
  current_question: Question | null;
  round_started_at: string | null;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlitzRunPayload {
  playerName: string;
  score: number;
  bestStreak: number;
  totalSolved: number;
  accuracy: number;
  examTrack: ExamTrack;
  difficulty: Difficulty;
  durationSeconds?: number;
}

/**
 * Fetch questions from Supabase questions table with fallback to local generator
 */
export async function fetchQuestionsFromDb(
  track: ExamTrack = 'gate',
  difficulty: Difficulty = 'easy',
  limit = 10
): Promise<Question[]> {
  if (!isSupabaseConfigured) {
    return Array.from({ length: limit }, () => generateQuestion(difficulty, track));
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .or(`exam_track.eq.${track},exam_track.eq.all`)
      .eq('difficulty', difficulty)
      .limit(limit);

    if (error || !data || data.length === 0) {
      // Fallback to local procedural generator if no questions returned or error
      return Array.from({ length: limit }, () => generateQuestion(difficulty, track));
    }

    // Map database rows to Question model
    return data.map((q) => ({
      id: q.id,
      text: q.text,
      options: (Array.isArray(q.options) ? q.options : []) as string[],
      correctIndex: q.correct_index,
      category: q.category as any,
      difficulty: q.difficulty as Difficulty,
      timeLimit: q.time_limit,
      examTrack: q.exam_track as ExamTrack,
      examTag: q.exam_tag || undefined,
      explanation: q.explanation || undefined,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch questions from DB, using generator fallback:', err);
    return Array.from({ length: limit }, () => generateQuestion(difficulty, track));
  }
}

/**
 * Create a new multiplayer room in Supabase
 */
export async function createSupabaseRoom(
  roomCode: string,
  hostName: string,
  examTrack: ExamTrack,
  difficulty: Difficulty,
  initialQuestion: Question,
  hostId = `user_${Date.now()}`
): Promise<RoomRecord | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        host_id: hostId,
        host_name: hostName,
        exam_track: examTrack,
        difficulty: difficulty,
        status: 'lobby',
        total_rounds: 10,
        current_round: 0,
        host_ready: true,
        current_question: initialQuestion as any,
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating room:', error);
      return null;
    }
    return data as unknown as RoomRecord;
  } catch (err) {
    console.error('[Supabase] Room creation exception:', err);
    return null;
  }
}

/**
 * Join an existing multiplayer room in Supabase
 */
export async function joinSupabaseRoom(
  roomCode: string,
  guestName: string,
  guestId = `user_${Date.now()}`
): Promise<RoomRecord | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const cleanCode = roomCode.trim().toUpperCase();

    // 1. Fetch room by code
    const { data: room, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .single();

    if (findError || !room) {
      console.error('[Supabase] Room not found:', findError);
      return null;
    }

    // 2. Update room with guest info and set status to countdown
    const { data: updatedRoom, error: joinError } = await supabase
      .from('rooms')
      .update({
        guest_id: guestId,
        guest_name: guestName,
        guest_ready: true,
        status: 'countdown',
        current_round: 1,
      })
      .eq('id', room.id)
      .select()
      .single();

    if (joinError) {
      console.error('[Supabase] Error joining room:', joinError);
      return null;
    }

    return updatedRoom as unknown as RoomRecord;
  } catch (err) {
    console.error('[Supabase] Room joining exception:', err);
    return null;
  }
}

/**
 * Subscribe to realtime room updates
 */
export function subscribeToRoomUpdates(
  roomId: string,
  onRoomChange: (updatedRoom: RoomRecord) => void
) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel(`room_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new) {
          onRoomChange(payload.new as unknown as RoomRecord);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Update player scores and advance question in a room
 */
export async function updateRoomState(
  roomId: string,
  updates: Partial<RoomRecord>
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('rooms')
      .update(updates as any)
      .eq('id', roomId);

    if (error) {
      console.error('[Supabase] Failed to update room:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Update room exception:', err);
    return false;
  }
}

/**
 * Submit player round answer to room_answers
 */
export async function submitPlayerAnswer(
  roomId: string,
  roundNumber: number,
  playerId: string,
  playerName: string,
  selectedOption: number,
  isCorrect: boolean,
  timeTakenMs: number,
  pointsAwarded: number
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase.from('room_answers').insert({
      room_id: roomId,
      round_number: roundNumber,
      player_id: playerId,
      player_name: playerName,
      selected_option: selectedOption,
      is_correct: isCorrect,
      time_taken_ms: timeTakenMs,
      points_awarded: pointsAwarded,
    });

    return !error;
  } catch (err) {
    console.error('[Supabase] Error saving player answer:', err);
    return false;
  }
}

/**
 * Save Solo Blitz run to Supabase leaderboard
 */
export async function submitSoloBlitzRun(payload: BlitzRunPayload): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase.from('solo_blitz_runs').insert({
      player_name: payload.playerName,
      score: payload.score,
      best_streak: payload.bestStreak,
      total_solved: payload.totalSolved,
      accuracy: payload.accuracy,
      exam_track: payload.examTrack,
      difficulty: payload.difficulty,
      duration_seconds: payload.durationSeconds || 60,
    });

    if (error) {
      console.error('[Supabase] Error submitting solo blitz run:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Solo blitz submission exception:', err);
    return false;
  }
}

/**
 * Fetch top leaderboard entries for Solo Blitz
 */
export async function fetchBlitzLeaderboard(track?: ExamTrack, limit = 15) {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('solo_blitz_runs')
      .select('*')
      .order('score', { ascending: false })
      .order('best_streak', { ascending: false })
      .limit(limit);

    if (track && track !== 'all') {
      query = query.or(`exam_track.eq.${track},exam_track.eq.all`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase] Failed to fetch leaderboard:', err);
    return [];
  }
}
