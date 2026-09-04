import { useGameStore } from '../../src/store/useGameStore';

// Mock database service calls
jest.mock('../../src/services/databaseService', () => ({
  createSupabaseRoom: jest.fn(() => Promise.resolve(null)),
  joinSupabaseRoom: jest.fn(() => Promise.resolve(null)),
  submitSoloBlitzRun: jest.fn(() => Promise.resolve(true)),
  updateSupabaseRoomGameState: jest.fn(() => Promise.resolve()),
  subscribeToRoom: jest.fn(() => ({ unsubscribe: jest.fn() })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
}));

describe('useGameStore Zustand Store', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useGameStore.getState().resetGame();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('initializes in idle phase with default settings', () => {
    const state = useGameStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.roundNumber).toBe(0);
    expect(state.player1.score).toBe(0);
    expect(state.player2.score).toBe(0);
  });

  it('starts duel mode into countdown phase', () => {
    useGameStore.getState().startDuel('medium', 'gate');

    const state = useGameStore.getState();
    expect(state.mode).toBe('duel');
    expect(state.phase).toBe('countdown');
    expect(state.difficulty).toBe('medium');
    expect(state.examTrack).toBe('gate');
    expect(state.currentQuestion).not.toBeNull();
    expect(state.player1.score).toBe(0);
    expect(state.player2.score).toBe(0);
  });

  it('starts solo blitz mode with countdown and 60s timer', () => {
    useGameStore.getState().startSoloBlitz('easy', 'placement');

    const state = useGameStore.getState();
    expect(state.mode).toBe('solo_blitz');
    expect(state.phase).toBe('countdown');
    expect(state.timer).toBe(60);
    expect(state.maxTime).toBe(60);
    expect(state.currentQuestion).not.toBeNull();
  });

  it('updates difficulty and exam track', () => {
    useGameStore.getState().setDifficulty('hard');
    expect(useGameStore.getState().difficulty).toBe('hard');

    useGameStore.getState().setExamTrack('cat');
    expect(useGameStore.getState().examTrack).toBe('cat');
  });

  it('evaluates answers correctly in playing phase and tracks score', () => {
    useGameStore.getState().startSoloBlitz('easy', 'gate');
    // Transition from countdown to playing
    useGameStore.getState().setPhase('playing');

    const question = useGameStore.getState().currentQuestion;
    expect(question).not.toBeNull();

    if (question) {
      const correctIdx = question.correctIndex;
      useGameStore.getState().submitAnswer(1, correctIdx);

      const updated = useGameStore.getState();
      expect(updated.player1.score).toBeGreaterThan(0);
      expect(updated.player1.streak).toBe(1);
      expect(updated.player1.answeredCorrect).toBe(true);
    }
  });

  it('resets game to idle phase cleanly', () => {
    useGameStore.getState().startDuel('hard', 'cat');
    useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.phase).toBe('idle');
    expect(state.currentQuestion).toBeNull();
    expect(state.roundNumber).toBe(0);
  });
});
