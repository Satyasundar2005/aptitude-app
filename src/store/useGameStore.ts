import { create } from 'zustand';
import {
  GameState,
  GameMode,
  GamePhase,
  Difficulty,
  ExamTrack,
  PlayerState,
  Question,
  OnlineRoom,
} from '../types/game';
import { generateQuestion, getTimeLimit } from '../services/questionGenerator';
import {
  createSupabaseRoom,
  joinSupabaseRoom,
  submitSoloBlitzRun,
} from '../services/databaseService';
import { useUserStore } from './useUserStore';

interface GameStore extends GameState {
  startDuel: (difficulty: Difficulty, track?: ExamTrack) => void;
  startSoloBlitz: (difficulty: Difficulty, track?: ExamTrack) => void;
  startPractice: (difficulty: Difficulty, track?: ExamTrack) => void;
  createOnlineRoom: (difficulty: Difficulty, track: ExamTrack, hostName?: string) => string;
  joinOnlineRoom: (roomCode: string, guestName?: string) => boolean;
  startQuickMatch: (difficulty: Difficulty, track: ExamTrack) => void;
  startOnlineMatch: () => void;
  submitAnswer: (playerId: number, answerIndex: number) => void;
  tickTimer: () => void;
  nextQuestion: () => void;
  setPhase: (phase: GamePhase) => void;
  resetGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setExamTrack: (track: ExamTrack) => void;
}

function createDefaultPlayer(id: number, name: string): PlayerState {
  return {
    id,
    name,
    score: 0,
    streak: 0,
    multiplier: 1,
    combo: 0,
    answeredCorrect: null,
    lastAnswerTime: 0,
  };
}

function calculateMultiplier(streak: number): number {
  if (streak >= 7) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

function evaluatePlayer(
  player: PlayerState,
  question: Question,
  answerIndex: number,
  timestamp: number
): PlayerState {
  const correct = answerIndex === question.correctIndex;

  if (correct) {
    const timeBonus = Math.max(0, question.timeLimit * 1000 - (timestamp - player.lastAnswerTime));
    const basePoints = 100;
    const newStreak = player.streak + 1;
    const newMultiplier = calculateMultiplier(newStreak);
    const points = Math.round((basePoints + timeBonus / 100) * newMultiplier);

    return {
      ...player,
      score: player.score + points,
      streak: newStreak,
      multiplier: newMultiplier,
      combo: player.combo + 1,
      answeredCorrect: true,
      lastAnswerTime: timestamp,
    };
  }

  return {
    ...player,
    streak: 0,
    multiplier: 1,
    combo: 0,
    answeredCorrect: false,
    lastAnswerTime: timestamp,
  };
}

let opponentTimeoutId: any = null;

function clearOpponentTimer() {
  if (opponentTimeoutId) {
    clearTimeout(opponentTimeoutId);
    opponentTimeoutId = null;
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'online_duel',
  phase: 'idle',
  difficulty: 'easy',
  examTrack: 'gate',
  timer: 60,
  maxTime: 60,
  maxScore: 10,
  currentQuestion: null,
  player1: createDefaultPlayer(1, 'You'),
  player2: createDefaultPlayer(2, 'Friend Rival'),
  onlineRoom: null,
  result: null,
  roundNumber: 0,
  totalRounds: 10,
  totalSolved: 14,
  bestStreak: 5,
  blitzHistory: [],

  setDifficulty: (difficulty: Difficulty) => set({ difficulty }),
  setExamTrack: (examTrack: ExamTrack) => set({ examTrack }),

  createOnlineRoom: (difficulty: Difficulty, track: ExamTrack, hostName?: string) => {
    clearOpponentTimer();
    const effectiveHostName = hostName || useUserStore.getState().profile.name || 'You';
    const prefix = track.toUpperCase().slice(0, 4);
    const randNum = Math.floor(100 + Math.random() * 900);
    const code = `${prefix}-${randNum}`;
    const initialQuestion = generateQuestion(difficulty, track);

    const newRoom: OnlineRoom = {
      roomCode: code,
      isHost: true,
      hostName: effectiveHostName,
      guestName: null,
      status: 'lobby',
      examTrack: track,
      difficulty,
      totalRounds: 10,
    };

    set({
      mode: 'online_duel',
      phase: 'lobby',
      examTrack: track,
      difficulty,
      onlineRoom: newRoom,
      currentQuestion: initialQuestion,
      player1: createDefaultPlayer(1, effectiveHostName),
      player2: createDefaultPlayer(2, 'Waiting for friend...'),
      roundNumber: 0,
      totalRounds: 10,
    });

    // Asynchronously register room in Supabase database
    createSupabaseRoom(code, effectiveHostName, track, difficulty, initialQuestion).catch((err) => {
      console.warn('[Supabase] Could not create remote room, continuing locally:', err);
    });

    return code;
  },

  joinOnlineRoom: (roomCode: string, guestName = 'You') => {
    clearOpponentTimer();
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) return false;

    const currentTrack = get().examTrack || 'gate';
    const currentDiff = get().difficulty || 'easy';

    const newRoom: OnlineRoom = {
      roomCode: cleanCode,
      isHost: false,
      hostName: 'Friend (Host)',
      guestName,
      status: 'countdown',
      examTrack: currentTrack,
      difficulty: currentDiff,
      totalRounds: 10,
    };

    const question = generateQuestion(currentDiff, currentTrack);

    set({
      mode: 'online_duel',
      phase: 'countdown',
      examTrack: currentTrack,
      difficulty: currentDiff,
      onlineRoom: newRoom,
      currentQuestion: question,
      timer: 60,
      maxTime: 60,
      maxScore: 10,
      player1: createDefaultPlayer(1, guestName),
      player2: createDefaultPlayer(2, 'Friend (Host)'),
      roundNumber: 1,
      totalRounds: 10,
    });

    // Asynchronously notify Supabase that guest joined
    joinSupabaseRoom(cleanCode, guestName).catch((err) => {
      console.warn('[Supabase] Could not join remote room, continuing locally:', err);
    });

    return true;
  },

  startQuickMatch: (difficulty: Difficulty, track: ExamTrack) => {
    clearOpponentTimer();
    const p1Name = useUserStore.getState().profile.name || 'You';
    const mockRivals = [
      'Aditya (IIT-B)',
      'Neha (IIM-A)',
      'Rohit (NIT-T)',
      'Pooja (BITS)',
      'Vikram (DTU)',
    ];
    const matchedRival = mockRivals[Math.floor(Math.random() * mockRivals.length)];
    const question = generateQuestion(difficulty, track);

    const quickRoom: OnlineRoom = {
      roomCode: `LIVE-${Math.floor(100 + Math.random() * 900)}`,
      isHost: true,
      hostName: p1Name,
      guestName: matchedRival,
      status: 'countdown',
      examTrack: track,
      difficulty,
      totalRounds: 10,
    };

    set({
      mode: 'online_duel',
      phase: 'countdown',
      difficulty,
      examTrack: track,
      onlineRoom: quickRoom,
      timer: 60,
      maxTime: 60,
      maxScore: 10,
      currentQuestion: question,
      player1: createDefaultPlayer(1, p1Name),
      player2: createDefaultPlayer(2, matchedRival),
      result: null,
      roundNumber: 1,
      totalRounds: 10,
    });
  },

  startOnlineMatch: () => {
    clearOpponentTimer();
    const state = get();
    const question = generateQuestion(state.difficulty, state.examTrack);

    set({
      phase: 'countdown',
      currentQuestion: question,
      timer: 60,
      maxTime: 60,
      maxScore: 10,
      roundNumber: 1,
      totalRounds: 10,
    });
  },

  // Offline 1v1 Split-Screen Duel (Preserved on Same Device)
  startDuel: (difficulty: Difficulty, track?: ExamTrack) => {
    clearOpponentTimer();
    const chosenTrack = track || get().examTrack || 'gate';
    const question = generateQuestion(difficulty, chosenTrack);
    set({
      mode: 'duel',
      phase: 'countdown',
      difficulty,
      examTrack: chosenTrack,
      timer: 60,
      maxTime: 60,
      maxScore: 10,
      currentQuestion: question,
      player1: createDefaultPlayer(1, 'Player 1'),
      player2: createDefaultPlayer(2, 'Player 2'),
      onlineRoom: null,
      result: null,
      roundNumber: 1,
      totalRounds: 10,
    });
  },

  startSoloBlitz: (difficulty: Difficulty, track?: ExamTrack) => {
    clearOpponentTimer();
    const chosenTrack = track || get().examTrack || 'gate';
    const question = generateQuestion(difficulty, chosenTrack);
    const qTime = getTimeLimit(difficulty);
    const p1Name = useUserStore.getState().profile.name || 'You';
    set({
      mode: 'solo_blitz',
      phase: 'countdown',
      difficulty,
      examTrack: chosenTrack,
      timer: qTime,
      maxTime: qTime,
      maxScore: 10,
      currentQuestion: question,
      player1: createDefaultPlayer(1, p1Name),
      player2: createDefaultPlayer(2, 'Test Benchmark'),
      onlineRoom: null,
      result: null,
      roundNumber: 1,
      totalRounds: 10,
      blitzHistory: [],
    });
  },

  startPractice: (difficulty: Difficulty, track?: ExamTrack) => {
    clearOpponentTimer();
    const chosenTrack = track || get().examTrack || 'gate';
    const question = generateQuestion(difficulty, chosenTrack);
    const p1Name = useUserStore.getState().profile.name || 'Student';
    set({
      mode: 'practice',
      phase: 'playing',
      difficulty,
      examTrack: chosenTrack,
      timer: 300,
      maxTime: 300,
      maxScore: 999,
      currentQuestion: question,
      player1: createDefaultPlayer(1, p1Name),
      player2: createDefaultPlayer(2, 'Exam Master'),
      onlineRoom: null,
      result: null,
      roundNumber: 1,
      totalRounds: 999,
    });
  },

  submitAnswer: (playerId: number, answerIndex: number) => {
    const state = get();
    if (state.phase !== 'playing' || !state.currentQuestion) return;

    const timestamp = Date.now();
    const playerKey = playerId === 1 ? 'player1' : 'player2';
    const currentPlayer = state[playerKey];

    if (currentPlayer.answeredCorrect !== null) return;

    const updatedPlayer = evaluatePlayer(
      currentPlayer,
      state.currentQuestion,
      answerIndex,
      timestamp
    );

    const newTotalSolved = updatedPlayer.answeredCorrect
      ? state.totalSolved + 1
      : state.totalSolved;
    const newBestStreak = Math.max(state.bestStreak, updatedPlayer.streak);

    set({
      [playerKey]: updatedPlayer,
      totalSolved: newTotalSolved,
      bestStreak: newBestStreak,
    } as Partial<GameStore>);

    if (state.mode === 'practice') {
      return;
    }

    // ONLINE DUEL or OFFLINE SPLIT SCREEN
    if (state.mode === 'duel' || state.mode === 'online_duel') {
      const otherKey = playerId === 1 ? 'player2' : 'player1';
      const otherPlayer = state[otherKey];

      // If in online duel and player 1 answered first, schedule opponent response if not answered yet
      if (state.mode === 'online_duel' && playerId === 1 && otherPlayer.answeredCorrect === null) {
        clearOpponentTimer();
        const opponentDelay = Math.floor(1000 + Math.random() * 2500);
        opponentTimeoutId = setTimeout(() => {
          const s = get();
          if (s.phase !== 'playing' || !s.currentQuestion || s.player2.answeredCorrect !== null)
            return;
          // 80% probability of online rival answering correctly
          const isCorrect = Math.random() < 0.82;
          const oppIdx = isCorrect
            ? s.currentQuestion.correctIndex
            : (s.currentQuestion.correctIndex + 1) % 4;
          s.submitAnswer(2, oppIdx);
        }, opponentDelay);
      }

      if (otherPlayer.answeredCorrect !== null || updatedPlayer.answeredCorrect === true) {
        clearOpponentTimer();
        setTimeout(() => {
          const s = get();
          if (s.phase !== 'playing') return;

          if (
            updatedPlayer.score >= s.maxScore ||
            otherPlayer.score >= s.maxScore ||
            s.roundNumber >= s.totalRounds
          ) {
            const winner =
              updatedPlayer.score > otherPlayer.score
                ? playerId
                : otherPlayer.score > updatedPlayer.score
                  ? otherKey === 'player1'
                    ? 1
                    : 2
                  : null;

            set({
              phase: 'game_over',
              result: {
                winnerId: winner,
                p1Score: s.player1.score,
                p2Score: s.player2.score,
                totalRounds: s.roundNumber,
                p1Correct: s.player1.combo,
                p2Correct: s.player2.combo,
                duration: s.maxTime - s.timer,
              },
            });
          } else {
            const nextQ = generateQuestion(s.difficulty, s.examTrack);
            set({
              currentQuestion: nextQ,
              roundNumber: s.roundNumber + 1,
              player1: { ...s.player1, answeredCorrect: null },
              player2: { ...s.player2, answeredCorrect: null },
            });
          }
        }, 900);
      }
    } else {
      // Solo blitz: Single-player Timed Exam Practice (GATE / CAT / GRE pace)
      const timeSpent = state.maxTime - state.timer;
      const historyRecord = {
        question: state.currentQuestion,
        selectedOptionIndex: answerIndex,
        isCorrect: updatedPlayer.answeredCorrect === true,
        timeTaken: Math.max(1, timeSpent),
      };

      const newHistory = [...state.blitzHistory, historyRecord];

      if (state.roundNumber >= state.totalRounds) {
        setTimeout(() => {
          const s = get();
          const correctCount = newHistory.filter((h) => h.isCorrect).length;
          const totalDuration = newHistory.reduce((acc, h) => acc + h.timeTaken, 0);
          set({
            phase: 'game_over',
            blitzHistory: newHistory,
            result: {
              winnerId: 1,
              p1Score: s.player1.score,
              p2Score: 0,
              totalRounds: s.totalRounds,
              p1Correct: correctCount,
              p2Correct: 0,
              duration: totalDuration,
            },
          });
          submitSoloBlitzRun({
            playerName: s.player1.name || 'You',
            score: s.player1.score,
            bestStreak: s.bestStreak,
            totalSolved: s.totalSolved,
            accuracy: s.totalRounds > 0 ? Math.round((correctCount / s.totalRounds) * 100) : 0,
            examTrack: s.examTrack,
            difficulty: s.difficulty,
            durationSeconds: totalDuration,
          }).catch((err) => console.warn('[Supabase] Could not save blitz run:', err));
        }, 500);
      } else {
        setTimeout(() => {
          const s = get();
          if (s.phase !== 'playing') return;
          const nextQ = generateQuestion(s.difficulty, s.examTrack);
          const qTime = getTimeLimit(s.difficulty);
          set({
            currentQuestion: nextQ,
            roundNumber: s.roundNumber + 1,
            timer: qTime,
            maxTime: qTime,
            blitzHistory: newHistory,
            player1: { ...s.player1, answeredCorrect: null },
          });
        }, 400);
      }
    }
  },

  tickTimer: () => {
    const state = get();
    if (state.phase !== 'playing') return;

    if (state.mode === 'practice') {
      if (state.timer <= 1) set({ timer: 300 });
      else set({ timer: state.timer - 1 });
      return;
    }

    if (state.mode === 'solo_blitz') {
      if (state.timer <= 1) {
        // Question timer expired in Solo Blitz
        const historyRecord = {
          question: state.currentQuestion!,
          selectedOptionIndex: null,
          isCorrect: false,
          timeTaken: state.maxTime,
        };
        const newHistory = [...state.blitzHistory, historyRecord];

        if (state.roundNumber >= state.totalRounds) {
          const correctCount = newHistory.filter((h) => h.isCorrect).length;
          const totalDuration = newHistory.reduce((acc, h) => acc + h.timeTaken, 0);
          set({
            timer: 0,
            phase: 'game_over',
            blitzHistory: newHistory,
            result: {
              winnerId: 1,
              p1Score: state.player1.score,
              p2Score: 0,
              totalRounds: state.totalRounds,
              p1Correct: correctCount,
              p2Correct: 0,
              duration: totalDuration,
            },
          });
          submitSoloBlitzRun({
            playerName: state.player1.name || 'You',
            score: state.player1.score,
            bestStreak: state.bestStreak,
            totalSolved: state.totalSolved,
            accuracy:
              state.totalRounds > 0 ? Math.round((correctCount / state.totalRounds) * 100) : 0,
            examTrack: state.examTrack,
            difficulty: state.difficulty,
            durationSeconds: totalDuration,
          }).catch((err) => console.warn('[Supabase] Could not save blitz run on timeout:', err));
        } else {
          const nextQ = generateQuestion(state.difficulty, state.examTrack);
          const qTime = getTimeLimit(state.difficulty);
          set({
            currentQuestion: nextQ,
            roundNumber: state.roundNumber + 1,
            timer: qTime,
            maxTime: qTime,
            blitzHistory: newHistory,
            player1: { ...state.player1, answeredCorrect: null },
          });
        }
        return;
      }

      set({ timer: state.timer - 1 });
      return;
    }

    if (state.timer <= 1) {
      clearOpponentTimer();
      set({
        timer: 0,
        phase: 'game_over',
        result: {
          winnerId:
            state.player1.score > state.player2.score
              ? 1
              : state.player2.score > state.player1.score
                ? 2
                : null,
          p1Score: state.player1.score,
          p2Score: state.player2.score,
          totalRounds: state.roundNumber,
          p1Correct: state.player1.combo,
          p2Correct: state.player2.combo,
          duration: state.maxTime,
        },
      });
    } else {
      set({ timer: state.timer - 1 });
    }
  },

  nextQuestion: () => {
    clearOpponentTimer();
    const state = get();
    const nextQ = generateQuestion(state.difficulty, state.examTrack);
    set({
      currentQuestion: nextQ,
      roundNumber: state.roundNumber + 1,
      player1: { ...state.player1, answeredCorrect: null },
      player2: { ...state.player2, answeredCorrect: null },
    });
  },

  setPhase: (phase: GamePhase) => set({ phase }),

  resetGame: () => {
    clearOpponentTimer();
    set({
      phase: 'idle',
      timer: 60,
      currentQuestion: null,
      player1: createDefaultPlayer(1, 'Player 1'),
      player2: createDefaultPlayer(2, 'Player 2'),
      onlineRoom: null,
      result: null,
      roundNumber: 0,
    });
  },
}));
