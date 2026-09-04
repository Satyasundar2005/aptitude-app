import { useUserStore } from '../../src/store/useUserStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
}));

describe('useUserStore Zustand Store', () => {
  beforeEach(() => {
    // Reset to default
    useUserStore.setState({
      profile: {
        name: 'Arjun Aspirant',
        email: 'arjun.aspirant@appticlash.io',
        avatar: '🎓',
        institution: 'IIT / NIT Aspirant',
        targetExam: 'gate',
        rating: 1280,
        rankTitle: 'Gold Scholar',
        isLoggedIn: true,
        memberSince: 'September 2026',
      },
      settings: {
        soundEnabled: true,
        hapticsEnabled: true,
        timerAlerts: true,
        showPyqTags: true,
        dailyGoal: 20,
        studyReminders: true,
      },
    });
  });

  it('initializes with default profile and settings', () => {
    const state = useUserStore.getState();
    expect(state.profile.name).toBe('Arjun Aspirant');
    expect(state.profile.rating).toBe(1280);
    expect(state.settings.soundEnabled).toBe(true);
  });

  it('updates profile fields selectively', () => {
    useUserStore.getState().updateProfile({
      name: 'Rohan Sharma',
      rating: 1420,
    });

    const state = useUserStore.getState();
    expect(state.profile.name).toBe('Rohan Sharma');
    expect(state.profile.rating).toBe(1420);
    expect(state.profile.email).toBe('arjun.aspirant@appticlash.io'); // unchanged
  });

  it('updates settings fields selectively', () => {
    useUserStore.getState().updateSettings({
      soundEnabled: false,
      dailyGoal: 35,
    });

    const state = useUserStore.getState();
    expect(state.settings.soundEnabled).toBe(false);
    expect(state.settings.dailyGoal).toBe(35);
    expect(state.settings.hapticsEnabled).toBe(true); // unchanged
  });

  it('updates user on login', () => {
    useUserStore.getState().login('Priya Verma', 'priya@exam.org', 'BITS Pilani', 'cat');

    const state = useUserStore.getState();
    expect(state.profile.name).toBe('Priya Verma');
    expect(state.profile.email).toBe('priya@exam.org');
    expect(state.profile.institution).toBe('BITS Pilani');
    expect(state.profile.targetExam).toBe('cat');
    expect(state.profile.isLoggedIn).toBe(true);
  });

  it('resets to guest state on logout', async () => {
    await useUserStore.getState().logout();

    const state = useUserStore.getState();
    expect(state.profile.name).toBe('Guest Player');
    expect(state.profile.isLoggedIn).toBe(false);
  });
});
