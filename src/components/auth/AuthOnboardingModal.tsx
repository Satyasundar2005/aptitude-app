import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Gift,
  Target,
  Trophy,
  Globe,
  Swords,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../store/useUserStore';
import { useRewardsStore } from '../../store/useRewardsStore';
import { ExamTrack } from '../../types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AVATAR_OPTIONS = ['🎓', '🧠', '⚡', '🎯', '🚀', '🦁', '🐯', '🦉', '👑', '🔥'];

const EXAM_TRACK_OPTIONS: { id: ExamTrack; label: string; desc: string; color: string }[] = [
  { id: 'gate', label: 'GATE', desc: 'CS, ME, EC, EE, CE', color: '#38BDF8' },
  { id: 'cat', label: 'CAT', desc: 'IIMs QA & DILR', color: '#A855F7' },
  { id: 'gre', label: 'GRE', desc: 'Quant & Comparison', color: '#06B6D4' },
  { id: 'ese', label: 'ESE / IES', desc: 'Paper-1 GS & Engg', color: '#F97316' },
  { id: 'placement', label: 'Campus', desc: 'TCS, Infosys, Wipro', color: '#34D399' },
  { id: 'banking', label: 'Banking', desc: 'SBI PO & SSC CGL', color: '#FBBF24' },
  { id: 'all', label: 'All Exams', desc: '10-Yr PYQ Mix', color: '#818CF8' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AuthOnboardingModal: React.FC<Props> = ({ visible, onClose }) => {
  const {
    profile,
    isLoadingAuth,
    authError,
    signUpWithSupabase,
    loginWithSupabase,
    login,
    completeOnboarding,
  } = useUserStore();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack>('gate');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your full name or nickname.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setErrorMsg(null);

    // Try Supabase sign up if email & password are provided
    if (email.trim() && password.length >= 6) {
      const res = await signUpWithSupabase(email.trim(), password, name.trim(), selectedTrack);
      if (!res.success) {
        // Fallback to offline profile with credentials preserved
        login(name.trim(), email.trim(), 'Aspirant', selectedTrack);
        useUserStore.getState().updateProfile({ avatar: selectedAvatar });
      }
    } else {
      // Local instant onboarding
      login(
        name.trim(),
        email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@appticlash.io`,
        'Aspirant',
        selectedTrack
      );
      useUserStore.getState().updateProfile({ avatar: selectedAvatar });
    }

    // Award initial welcome bonus of +100 pts
    const userStore = useUserStore.getState();
    userStore.updateProfile({
      rating: (userStore.profile.rating || 1200) + 100,
      hasCompletedOnboarding: true,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onClose();
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setErrorMsg(null);

    const res = await loginWithSupabase(email.trim(), password);
    if (!res.success) {
      setErrorMsg(res.error || 'Login failed. Check your email or password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    completeOnboarding();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onClose();
  };

  const handleContinueAsGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    completeOnboarding('Aspirant', selectedAvatar, selectedTrack);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss / continue as guest */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleContinueAsGuest}
        />

        <View style={styles.cardContainer}>
          <LinearGradient colors={['#1e1b4b', '#0f172a', '#0b0f19']} style={styles.cardGradient}>
            {/* Close Button at top right */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleContinueAsGuest}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Header with App Logo & Welcome Banner */}
            <View style={styles.headerBlock}>
              <View style={styles.logoBadge}>
                <Brain size={26} color="#818CF8" />
              </View>
              <Text style={styles.appTitle}>APTICLASH</Text>
              <Text style={styles.appTagline}>Competitive Aptitude & 10-Yr PYQs</Text>
              <Text style={styles.welcomeDesc}>
                Create an account to track your progress, compete with friends online or offline,
                and earn reward points!
              </Text>
            </View>

            {/* Mode Selector Tabs (Create Account vs Sign In) */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setMode('signup');
                  setErrorMsg(null);
                }}
              >
                <Sparkles size={14} color={mode === 'signup' ? '#818CF8' : '#64748B'} />
                <Text style={[styles.modeTabText, mode === 'signup' && styles.modeTabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, mode === 'signin' && styles.modeTabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setMode('signin');
                  setErrorMsg(null);
                }}
              >
                <User size={14} color={mode === 'signin' ? '#818CF8' : '#64748B'} />
                <Text style={[styles.modeTabText, mode === 'signin' && styles.modeTabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <ScrollView
              contentContainerStyle={styles.formScroll}
              showsVerticalScrollIndicator={false}
            >
              {mode === 'signup' ? (
                <>
                  {/* Avatar Picker */}
                  <Text style={styles.inputLabel}>CHOOSE YOUR AVATAR</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.avatarScroll}
                  >
                    {AVATAR_OPTIONS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.avatarItem,
                          selectedAvatar === emoji && styles.avatarItemActive,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setSelectedAvatar(emoji);
                        }}
                      >
                        <Text style={styles.avatarEmoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Name Input */}
                  <Text style={styles.inputLabel}>YOUR NAME / NICKNAME</Text>
                  <View style={styles.inputWrapper}>
                    <User size={16} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Arjun Sharma"
                      placeholderTextColor="#475569"
                      maxLength={25}
                    />
                  </View>

                  {/* Target Exam Track Picker */}
                  <Text style={styles.inputLabel}>TARGET EXAM</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.trackScroll}
                  >
                    {EXAM_TRACK_OPTIONS.map((track) => (
                      <TouchableOpacity
                        key={track.id}
                        style={[
                          styles.trackChip,
                          selectedTrack === track.id && {
                            borderColor: track.color,
                            backgroundColor: track.color + '20',
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setSelectedTrack(track.id);
                        }}
                      >
                        <Text
                          style={[
                            styles.trackChipLabel,
                            selectedTrack === track.id && { color: track.color },
                          ]}
                        >
                          {track.label}
                        </Text>
                        <Text style={styles.trackChipSub}>{track.desc}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Email (Optional/Recommended) */}
                  <Text style={styles.inputLabel}>EMAIL (OPTIONAL)</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={16} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="student@example.com"
                      placeholderTextColor="#475569"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Password (Optional) */}
                  <Text style={styles.inputLabel}>PASSWORD (OPTIONAL, MIN 6 CHARS)</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={16} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                    />
                  </View>

                  {/* Welcome Bonus Callout */}
                  <View style={styles.bonusBanner}>
                    <Gift size={16} color="#F59E0B" style={{ marginRight: 8 }} />
                    <Text style={styles.bonusText}>
                      Instant{' '}
                      <Text style={{ color: '#FBBF24', fontWeight: '900' }}>
                        +100 Reward Points
                      </Text>{' '}
                      added to your account upon registration!
                    </Text>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleCreateAccount}
                    disabled={isLoadingAuth}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#6366F1', '#4F46E5']}
                      style={styles.primaryBtnGradient}
                    >
                      {isLoadingAuth ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Text style={styles.primaryBtnText}>Start Journey (+100 PTS)</Text>
                          <ArrowRight size={18} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Sign In View */}
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={16} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="student@example.com"
                      placeholderTextColor="#475569"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={16} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleSignIn}
                    disabled={isLoadingAuth}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#6366F1', '#4F46E5']}
                      style={styles.primaryBtnGradient}
                    >
                      {isLoadingAuth ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Text style={styles.primaryBtnText}>Sign In to ApptiClash</Text>
                          <ArrowRight size={18} color="#FFFFFF" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* Guest / Skip Option */}
              <TouchableOpacity
                style={styles.guestLink}
                onPress={handleContinueAsGuest}
                activeOpacity={0.7}
              >
                <Text style={styles.guestLinkText}>Continue as Guest ➔</Text>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    height: Math.min(SCREEN_HEIGHT * 0.84, 660),
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    elevation: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    position: 'relative',
    zIndex: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formScroll: {
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },
  avatarScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatarItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarItemActive: {
    borderColor: '#818CF8',
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    transform: [{ scale: 1.08 }],
  },
  avatarEmoji: {
    fontSize: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 10,
  },
  trackScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  trackChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
    alignItems: 'center',
  },
  trackChipLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  trackChipSub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  bonusText: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  guestLinkText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
});
