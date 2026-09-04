import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  User,
  Settings,
  LogOut,
  LogIn,
  X,
  Check,
  Edit3,
  Award,
  Trophy,
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Shield,
  Info,
  RefreshCw,
  Flame,
  CheckCircle2,
  Target,
  GraduationCap,
  ChevronRight,
  HelpCircle,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react-native';
import { useUserStore } from '../store/useUserStore';
import { useGameStore } from '../store/useGameStore';
import { ExamTrack } from '../types/game';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 380);

const AVATAR_OPTIONS = ['🎓', '🧠', '⚡', '🎯', '🚀', '🦁', '🐯', '🦉', '👑', '🔥'];

const EXAM_OPTIONS: { id: ExamTrack; label: string; tag: string }[] = [
  { id: 'gate', label: 'GATE', tag: 'CS, ME, EC, EE' },
  { id: 'cat', label: 'CAT', tag: 'IIMs QA & DILR' },
  { id: 'gre', label: 'GRE', tag: 'Quant Comparison' },
  { id: 'ese', label: 'ESE / IES', tag: 'Paper-1 GS & Engg' },
  { id: 'placement', label: 'Campus', tag: 'TCS, Infosys, Wipro' },
  { id: 'banking', label: 'Banking', tag: 'SBI PO & SSC CGL' },
  { id: 'all', label: 'All Exams', tag: '10-Yr PYQ Mix' },
];

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: 'duel' | 'solo' | 'practice' | 'online') => void;
}

export default function ProfileMenuModal({ visible, onClose, onNavigate }: ProfileMenuModalProps) {
  const insets = useSafeAreaInsets();
  const {
    profile,
    settings,
    updateProfile,
    updateSettings,
    logout,
    loginWithSupabase,
    signUpWithSupabase,
    isLoadingAuth,
    authError,
  } = useUserStore();
  const { totalSolved, bestStreak, examTrack, setExamTrack } = useGameStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'help'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editInstitution, setEditInstitution] = useState(profile.institution);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  // Supabase Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authTrack, setAuthTrack] = useState<ExamTrack>('gate');
  const [showPassword, setShowPassword] = useState(false);
  const [localAuthError, setLocalAuthError] = useState<string | null>(null);

  const handleOpenEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditInstitution(profile.institution);
    setSelectedAvatar(profile.avatar);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateProfile({
      name: editName.trim() || profile.name,
      email: editEmail.trim() || profile.email,
      institution: editInstitution.trim() || profile.institution,
      avatar: selectedAvatar,
    });
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Log Out', 'Are you sure you want to log out of your ApptiClash account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleAuthSubmit = async () => {
    setLocalAuthError(null);
    if (!authEmail.trim()) {
      setLocalAuthError('Please enter your email address.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!authPassword.trim()) {
      setLocalAuthError('Please enter your password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (authMode === 'signup') {
      if (!authName.trim()) {
        setLocalAuthError('Please enter your name.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      if (authPassword.length < 6) {
        setLocalAuthError('Password must be at least 6 characters.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const res = await signUpWithSupabase(authEmail, authPassword, authName, authTrack);
      if (res.success) {
        if (res.requiresEmailConfirmation) {
          Alert.alert(
            'Check Your Email',
            res.message || 'Please verify your email to complete registration.'
          );
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setShowLoginModal(false);
        setAuthPassword('');
        setAuthEmail('');
        setAuthName('');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLocalAuthError(res.error || 'Failed to create account.');
      }
    } else {
      const res = await loginWithSupabase(authEmail, authPassword);
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowLoginModal(false);
        setAuthPassword('');
        setAuthEmail('');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLocalAuthError(res.error || 'Failed to sign in.');
      }
    }
  };

  const handleResetStats = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reset Solved Stats',
      'This will reset your solved questions count and streak back to 0. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            useGameStore.setState({ totalSolved: 0, bestStreak: 0 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const goalProgress = Math.min(100, Math.round((totalSolved / (settings.dailyGoal || 20)) * 100));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop touchable */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Slide-in Drawer Container */}
        <View
          style={[
            styles.drawerContainer,
            { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <LinearGradient colors={['#131a32', '#0f172a', '#0b1120']} style={styles.drawerGradient}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleRow}>
                <View style={styles.headerIconGlow}>
                  <User size={18} color="#818cf8" />
                </View>
                <View>
                  <Text style={styles.drawerTitle}>MY ACCOUNT</Text>
                  <Text style={styles.drawerSubtitle}>Profile, Settings & PYQ Progress</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('profile');
                }}
              >
                <User size={14} color={activeTab === 'profile' ? '#818cf8' : '#64748b'} />
                <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                  Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('settings');
                }}
              >
                <Settings size={14} color={activeTab === 'settings' ? '#818cf8' : '#64748b'} />
                <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                  Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'help' && styles.tabButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('help');
                }}
              >
                <HelpCircle size={14} color={activeTab === 'help' ? '#818cf8' : '#64748b'} />
                <Text style={[styles.tabText, activeTab === 'help' && styles.tabTextActive]}>
                  Guide
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.drawerScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* TAB 1: PROFILE DETAILS */}
              {activeTab === 'profile' && (
                <View style={styles.tabContent}>
                  {/* User Profile Card */}
                  <View style={styles.profileCard}>
                    <LinearGradient
                      colors={['rgba(99, 102, 241, 0.25)', 'rgba(30, 41, 59, 0.5)']}
                      style={styles.profileGradient}
                    >
                      <View style={styles.profileMainRow}>
                        <TouchableOpacity
                          style={styles.avatarWrapper}
                          onPress={handleOpenEdit}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.avatarText}>{profile.avatar}</Text>
                          <View style={styles.avatarEditBadge}>
                            <Edit3 size={10} color="#ffffff" />
                          </View>
                        </TouchableOpacity>

                        <View style={styles.profileDetails}>
                          <View style={styles.profileNameRow}>
                            <Text style={styles.profileName} numberOfLines={1}>
                              {profile.name}
                            </Text>
                            {profile.isLoggedIn ? (
                              <View style={styles.verifiedBadge}>
                                <Sparkles size={11} color="#38bdf8" />
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.profileEmail} numberOfLines={1}>
                            {profile.isLoggedIn ? profile.email : 'Local Guest Account'}
                          </Text>
                          {profile.username ? (
                            <Text
                              style={[styles.profileInstitution, { color: '#818cf8' }]}
                              numberOfLines={1}
                            >
                              @{profile.username}
                            </Text>
                          ) : (
                            <Text style={styles.profileInstitution} numberOfLines={1}>
                              🏛️ {profile.institution}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Rank & Rating Pill */}
                      <View style={styles.ratingBadgeRow}>
                        <View style={styles.ratingTag}>
                          <Trophy size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                          <Text style={styles.ratingValue}>{profile.rating} PTS</Text>
                          <Text style={styles.ratingTier}>• {profile.rankTitle}</Text>
                        </View>
                        {profile.isLoggedIn ? (
                          <TouchableOpacity
                            style={styles.editProfileBtn}
                            onPress={handleOpenEdit}
                            activeOpacity={0.7}
                          >
                            <Edit3 size={12} color="#818cf8" style={{ marginRight: 4 }} />
                            <Text style={styles.editProfileText}>Edit</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.editProfileBtn,
                              {
                                borderColor: '#38bdf8',
                                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              },
                            ]}
                            onPress={() => setShowLoginModal(true)}
                            activeOpacity={0.7}
                          >
                            <LogIn size={12} color="#38bdf8" style={{ marginRight: 4 }} />
                            <Text style={[styles.editProfileText, { color: '#38bdf8' }]}>
                              Sign In
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Battle Match Record */}
                      <View style={styles.duelRecordRow}>
                        <View style={styles.duelRecordItem}>
                          <Text style={styles.duelRecordVal}>{profile.totalMatches || 0}</Text>
                          <Text style={styles.duelRecordLbl}>Matches</Text>
                        </View>
                        <View style={styles.duelRecordDivider} />
                        <View style={styles.duelRecordItem}>
                          <Text style={[styles.duelRecordVal, { color: '#10b981' }]}>
                            {profile.wins || 0}
                          </Text>
                          <Text style={styles.duelRecordLbl}>Wins</Text>
                        </View>
                        <View style={styles.duelRecordDivider} />
                        <View style={styles.duelRecordItem}>
                          <Text style={[styles.duelRecordVal, { color: '#f43f5e' }]}>
                            {profile.losses || 0}
                          </Text>
                          <Text style={styles.duelRecordLbl}>Losses</Text>
                        </View>
                        <View style={styles.duelRecordDivider} />
                        <View style={styles.duelRecordItem}>
                          <Text style={[styles.duelRecordVal, { color: '#38bdf8' }]}>
                            {profile.totalMatches && profile.totalMatches > 0
                              ? Math.round(((profile.wins || 0) / profile.totalMatches) * 100)
                              : 0}
                            %
                          </Text>
                          <Text style={styles.duelRecordLbl}>Win %</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Quick Solved Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxHeader}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <Text style={styles.statBoxTitle}>Solved</Text>
                      </View>
                      <Text style={styles.statBoxNumber}>{totalSolved}</Text>
                      <Text style={styles.statBoxSub}>PYQ Problems</Text>
                    </View>

                    <View style={styles.statBox}>
                      <View style={styles.statBoxHeader}>
                        <Flame size={16} color="#f59e0b" />
                        <Text style={styles.statBoxTitle}>Best Streak</Text>
                      </View>
                      <Text style={styles.statBoxNumber}>{bestStreak}</Text>
                      <Text style={styles.statBoxSub}>In A Row</Text>
                    </View>
                  </View>

                  {/* Daily Goal Bar */}
                  <View style={styles.goalCard}>
                    <View style={styles.goalHeaderRow}>
                      <View style={styles.goalTitleGroup}>
                        <Target size={15} color="#38bdf8" style={{ marginRight: 6 }} />
                        <Text style={styles.goalTitle}>Daily Target Goal</Text>
                      </View>
                      <Text style={styles.goalNumbers}>
                        {totalSolved} / {settings.dailyGoal} Qs ({goalProgress}%)
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${goalProgress}%` }]} />
                    </View>
                  </View>

                  {/* Target Exam Quick Switcher */}
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeader}>TARGET EXAM TRACK</Text>
                    <View style={styles.examPickerList}>
                      {EXAM_OPTIONS.map((item) => {
                        const isSelected = examTrack === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.examPickItem, isSelected && styles.examPickItemActive]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setExamTrack(item.id);
                              updateProfile({ targetExam: item.id });
                            }}
                          >
                            <View>
                              <Text
                                style={[
                                  styles.examPickLabel,
                                  isSelected && styles.examPickLabelActive,
                                ]}
                              >
                                {item.label}
                              </Text>
                              <Text style={styles.examPickTag}>{item.tag}</Text>
                            </View>
                            {isSelected && <Check size={16} color="#818cf8" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Account Action: Log Out or Sign In */}
                  <View style={styles.accountActionSection}>
                    {profile.isLoggedIn ? (
                      <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                      >
                        <LogOut size={16} color="#f43f5e" />
                        <Text style={styles.logoutBtnText}>Log Out</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => setShowLoginModal(true)}
                        activeOpacity={0.8}
                      >
                        <LogIn size={16} color="#ffffff" />
                        <Text style={styles.loginBtnText}>Sign In / Register</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* TAB 2: SETTINGS */}
              {activeTab === 'settings' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionHeader}>PREFERENCES & CONTROLS</Text>

                  {/* Sound Effects */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      {settings.soundEnabled ? (
                        <Volume2 size={20} color="#818cf8" />
                      ) : (
                        <VolumeX size={20} color="#64748b" />
                      )}
                      <View style={styles.settingTextGroup}>
                        <Text style={styles.settingLabel}>Sound Effects</Text>
                        <Text style={styles.settingDesc}>Timer beeps & duel audio cues</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings.soundEnabled}
                      onValueChange={(val) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateSettings({ soundEnabled: val });
                      }}
                      trackColor={{ false: '#334155', true: '#6366f1' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Haptic Feedback */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <Smartphone size={20} color="#34d399" />
                      <View style={styles.settingTextGroup}>
                        <Text style={styles.settingLabel}>Haptic Feedback</Text>
                        <Text style={styles.settingDesc}>Tactile vibration on tap & answers</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings.hapticsEnabled}
                      onValueChange={(val) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateSettings({ hapticsEnabled: val });
                      }}
                      trackColor={{ false: '#334155', true: '#34d399' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Show PYQ Tags */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <GraduationCap size={20} color="#38bdf8" />
                      <View style={styles.settingTextGroup}>
                        <Text style={styles.settingLabel}>10-Yr PYQ Citation Tags</Text>
                        <Text style={styles.settingDesc}>
                          Show exam year badges (e.g. GATE 2023)
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={settings.showPyqTags}
                      onValueChange={(val) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateSettings({ showPyqTags: val });
                      }}
                      trackColor={{ false: '#334155', true: '#38bdf8' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Daily Reminders */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <Bell size={20} color="#f59e0b" />
                      <View style={styles.settingTextGroup}>
                        <Text style={styles.settingLabel}>Daily Practice Goal</Text>
                        <Text style={styles.settingDesc}>Target problems per study session</Text>
                      </View>
                    </View>
                    <View style={styles.goalChipsRow}>
                      {[10, 20, 30].map((goal) => (
                        <TouchableOpacity
                          key={goal}
                          style={[
                            styles.goalChip,
                            settings.dailyGoal === goal && styles.goalChipActive,
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            updateSettings({ dailyGoal: goal });
                          }}
                        >
                          <Text
                            style={[
                              styles.goalChipText,
                              settings.dailyGoal === goal && styles.goalChipTextActive,
                            ]}
                          >
                            {goal}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Data & Storage Actions */}
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeader}>DATA & STORAGE</Text>
                    <TouchableOpacity
                      style={styles.resetStatsBtn}
                      onPress={handleResetStats}
                      activeOpacity={0.8}
                    >
                      <RefreshCw size={16} color="#f59e0b" />
                      <Text style={styles.resetStatsText}>Reset Solved Counts & Streak</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Version & Credits */}
                  <View style={styles.aboutBlock}>
                    <Shield size={16} color="#64748b" style={{ marginBottom: 6 }} />
                    <Text style={styles.versionText}>ApptiClash v1.0.0</Text>
                    <Text style={styles.versionSub}>
                      Authentic 2015-2024 PYQ Engine with Realtime Duel Support
                    </Text>
                  </View>
                </View>
              )}

              {/* TAB 3: GAME GUIDE & FEATURES */}
              {activeTab === 'help' && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionHeader}>HOW TO PLAY & MODES</Text>

                  {/* Online Multiplayer */}
                  <View style={styles.helpCard}>
                    <View style={styles.helpHeader}>
                      <View style={[styles.helpIconDot, { backgroundColor: '#6366f1' }]}>
                        <Award size={14} color="#ffffff" />
                      </View>
                      <Text style={styles.helpTitle}>Online Multiplayer</Text>
                    </View>
                    <Text style={styles.helpBody}>
                      Create a private room and share the 6-character room code with a friend
                      anywhere. Or tap Instant Match to challenge live online aspirants.
                    </Text>
                  </View>

                  {/* 1v1 Split Screen */}
                  <View style={styles.helpCard}>
                    <View style={styles.helpHeader}>
                      <View style={[styles.helpIconDot, { backgroundColor: '#ec4899' }]}>
                        <Smartphone size={14} color="#ffffff" />
                      </View>
                      <Text style={styles.helpTitle}>1v1 Split Screen (Offline)</Text>
                    </View>
                    <Text style={styles.helpBody}>
                      Place your phone or tablet on a table between you and a friend. The screen
                      splits and rotates 180° for face-to-face tabletop dueling with no internet
                      needed!
                    </Text>
                  </View>

                  {/* Timed Solo Sprint */}
                  <View style={styles.helpCard}>
                    <View style={styles.helpHeader}>
                      <View style={[styles.helpIconDot, { backgroundColor: '#be185d' }]}>
                        <Flame size={14} color="#ffffff" />
                      </View>
                      <Text style={styles.helpTitle}>Timed Solo Sprint (10 PYQs)</Text>
                    </View>
                    <Text style={styles.helpBody}>
                      Simulates real exam speed pressure (30s / 45s / 60s per Q). Review detailed
                      step-by-step solutions at the end of the run.
                    </Text>
                  </View>

                  {/* PYQ Practice Drill */}
                  <View style={styles.helpCard}>
                    <View style={styles.helpHeader}>
                      <View style={[styles.helpIconDot, { backgroundColor: '#0284c7' }]}>
                        <BookOpen size={14} color="#ffffff" />
                      </View>
                      <Text style={styles.helpTitle}>Practice & PYQ Drill</Text>
                    </View>
                    <Text style={styles.helpBody}>
                      Untimed study mode with immediate step-by-step math breakdowns, formulas, and
                      official exam question references.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditingProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditingProfile(false)}
      >
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalCard}>
            <View style={styles.subModalHeader}>
              <Text style={styles.subModalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditingProfile(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Avatar Selector */}
            <Text style={styles.inputLabel}>Choose Avatar</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.avatarPickerRow}
            >
              {AVATAR_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === emoji && styles.avatarOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedAvatar(emoji);
                  }}
                >
                  <Text style={styles.avatarOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Display Name Input */}
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Arjun Sharma"
              placeholderTextColor="#64748b"
              maxLength={24}
            />

            {/* Email Input */}
            <Text style={styles.inputLabel}>Email / Handle</Text>
            <TextInput
              style={styles.textInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="e.g. arjun@appticlash.io"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Institution Input */}
            <Text style={styles.inputLabel}>College / Institute</Text>
            <TextInput
              style={styles.textInput}
              value={editInstitution}
              onChangeText={setEditInstitution}
              placeholder="e.g. IIT Bombay / Final Year"
              placeholderTextColor="#64748b"
              maxLength={40}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <Check size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.saveProfileText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUPABASE SIGN IN / SIGN UP MODAL */}
      <Modal
        visible={showLoginModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowLoginModal(false);
          setLocalAuthError(null);
        }}
      >
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalCard}>
            <View style={styles.subModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldCheck size={20} color="#818cf8" style={{ marginRight: 8 }} />
                <Text style={styles.subModalTitle}>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowLoginModal(false);
                  setLocalAuthError(null);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Mode Switcher Tabs */}
            <View style={styles.authModeToggle}>
              <TouchableOpacity
                style={[styles.authToggleBtn, authMode === 'signin' && styles.authToggleBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAuthMode('signin');
                  setLocalAuthError(null);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.authToggleText,
                    authMode === 'signin' && styles.authToggleTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authToggleBtn, authMode === 'signup' && styles.authToggleBtnActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAuthMode('signup');
                  setLocalAuthError(null);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.authToggleText,
                    authMode === 'signup' && styles.authToggleTextActive,
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message Box */}
            {(localAuthError || authError) && (
              <View style={styles.authErrorBox}>
                <AlertCircle size={15} color="#f43f5e" style={{ marginRight: 6 }} />
                <Text style={styles.authErrorText}>{localAuthError || authError}</Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Full Name (Sign Up only) */}
              {authMode === 'signup' && (
                <>
                  <Text style={styles.inputLabel}>Full Name / Aspirant Name</Text>
                  <View style={styles.authInputContainer}>
                    <User size={16} color="#64748b" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.authInputField}
                      value={authName}
                      onChangeText={setAuthName}
                      placeholder="e.g. Arjun Sharma"
                      placeholderTextColor="#64748b"
                      autoCapitalize="words"
                    />
                  </View>

                  <Text style={styles.inputLabel}>Primary Exam Track</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.trackScrollRow}
                  >
                    {EXAM_OPTIONS.filter((e) => e.id !== 'all').map((e) => {
                      const isSelected = authTrack === e.id;
                      return (
                        <TouchableOpacity
                          key={e.id}
                          style={[styles.trackPill, isSelected && styles.trackPillActive]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setAuthTrack(e.id);
                          }}
                        >
                          <Text
                            style={[styles.trackPillText, isSelected && styles.trackPillTextActive]}
                          >
                            {e.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              {/* Email Address */}
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.authInputContainer}>
                <Mail size={16} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.authInputField}
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  placeholder="aspirant@example.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.authInputContainer}>
                <Lock size={16} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.authInputField, { flex: 1 }]}
                  value={authPassword}
                  onChangeText={setAuthPassword}
                  placeholder={
                    authMode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'
                  }
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#94a3b8" />
                  ) : (
                    <Eye size={16} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.saveProfileBtn, isLoadingAuth && { opacity: 0.7 }]}
                onPress={handleAuthSubmit}
                disabled={isLoadingAuth}
                activeOpacity={0.8}
              >
                {isLoadingAuth ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <LogIn size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.saveProfileText}>
                      {authMode === 'signin' ? 'Sign In to ApptiClash' : 'Create Account'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Switch Mode Helper Link */}
              <TouchableOpacity
                style={styles.authSwitchBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setLocalAuthError(null);
                }}
              >
                <Text style={styles.authSwitchText}>
                  {authMode === 'signin'
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#0f172a',
    borderRightWidth: 1,
    borderRightColor: 'rgba(99, 102, 241, 0.25)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  drawerGradient: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  drawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconGlow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  drawerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#818cf8',
    fontWeight: '800',
  },
  drawerScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  tabContent: {
    gap: 16,
  },
  // PROFILE CARD
  profileCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  profileGradient: {
    padding: 16,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#818cf8',
    position: 'relative',
  },
  avatarText: {
    fontSize: 30,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  profileDetails: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 6,
    padding: 2,
  },
  profileEmail: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  profileInstitution: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
    marginRight: 4,
  },
  ratingTier: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fef3c7',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editProfileText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#818cf8',
  },
  // STATS GRID
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  statBoxNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  statBoxSub: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  // DAILY GOAL
  goalCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
  },
  goalNumbers: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  // SECTIONS
  sectionBlock: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  examPickerList: {
    gap: 6,
  },
  examPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  examPickItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  examPickLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  examPickLabelActive: {
    color: '#818cf8',
  },
  examPickTag: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  // SETTINGS ROWS
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  settingDesc: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  goalChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  goalChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalChipActive: {
    backgroundColor: '#6366f1',
  },
  goalChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
  },
  goalChipTextActive: {
    color: '#ffffff',
  },
  resetStatsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  resetStatsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f59e0b',
  },
  aboutBlock: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  versionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  versionSub: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  // HELP CARDS
  helpCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  helpIconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  helpBody: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    fontWeight: '500',
  },
  // ACCOUNT ACTIONS
  accountActionSection: {
    marginTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f43f5e',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  // SUB-MODALS (EDIT PROFILE / LOGIN)
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  subModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  subModalDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  avatarOptionText: {
    fontSize: 22,
  },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  saveProfileText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  // Duel record row inside profile card
  duelRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  duelRecordItem: {
    alignItems: 'center',
  },
  duelRecordVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  duelRecordLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  duelRecordDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Auth Modal Controls
  authModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  authToggleBtnActive: {
    backgroundColor: '#6366f1',
  },
  authToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  authToggleTextActive: {
    color: '#ffffff',
  },
  authErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  authErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f43f5e',
    flex: 1,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  authInputField: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
  },
  trackScrollRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  trackPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  trackPillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: '#818cf8',
  },
  trackPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  trackPillTextActive: {
    color: '#ffffff',
  },
  authSwitchBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  authSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
  },
});
