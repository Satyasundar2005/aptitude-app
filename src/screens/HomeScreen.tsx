import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Brain,
  Swords,
  Zap,
  GraduationCap,
  Briefcase,
  Landmark,
  TrendingUp,
  Compass,
  Flame,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Target,
  Globe,
  Users,
  Menu,
  User,
  Gift,
  Trophy,
  Coins,
  Map,
  Play,
  Share2,
  Copy,
  Check,
  Shield,
  Layers,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { useRewardsStore } from '../store/useRewardsStore';
import { useSoloStudyStore } from '../store/useSoloStudyStore';
import { Difficulty, ExamTrack } from '../types/game';
import { StudyLevel, StageId } from '../types/soloStudy';
import { SOLO_CURRICULUM } from '../data/soloCurriculum';

import OnlineLobbyModal from './OnlineLobbyModal';
import ProfileMenuModal from '../components/ProfileMenuModal';
import { DailyRewardsModal } from '../components/rewards/DailyRewardsModal';
import { MatiksJourneyPath } from '../components/solo/MatiksJourneyPath';
import { LessonInteractiveModal } from '../components/solo/LessonInteractiveModal';
import { AuthOnboardingModal } from '../components/auth/AuthOnboardingModal';
import { InfoButton } from '../components/common/InfoButton';
import { FeatureInfoModal } from '../components/common/FeatureInfoModal';
import { FEATURE_EXPLANATIONS } from '../data/featureExplanations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Screen = 'home' | 'difficulty' | 'duel' | 'solo' | 'practice' | 'online';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface ExamTrackConfig {
  id: ExamTrack;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  gradient: [string, string];
  icon: typeof GraduationCap;
  topics: string[];
}

const EXAM_TRACKS: ExamTrackConfig[] = [
  {
    id: 'gate',
    title: 'GATE (10-Yr PYQ)',
    subtitle: 'CS, ME, EC, EE, CE, DA Aptitude',
    badge: '2015-2024 PYQs',
    color: '#38bdf8',
    gradient: ['#0284c7', '#0369a1'],
    icon: GraduationCap,
    topics: ['Work & Time', 'Speed & Distance', 'Probability', 'Spatial & Geometry', 'Modular Math'],
  },
  {
    id: 'cat',
    title: 'CAT (10-Yr PYQ)',
    subtitle: 'IIMs QA, DILR & High-order Logic',
    badge: '2015-2024 PYQs',
    color: '#a855f7',
    gradient: ['#9333ea', '#7e22ce'],
    icon: TrendingUp,
    topics: ['P & C', 'Profit & Loss', 'Alligations', 'Progressions', 'Arrangements'],
  },
  {
    id: 'gre',
    title: 'GRE (10-Yr PYQ)',
    subtitle: 'Quant Comparison & Reasoning',
    badge: '2015-2024 PYQs',
    color: '#06b6d4',
    gradient: ['#0891b2', '#0e7490'],
    icon: Target,
    topics: ['Quant Comparison', 'Data Interpretation', 'Algebra & Word', 'Geometry', 'Number Properties'],
  },
  {
    id: 'ese',
    title: 'ESE / IES (10-Yr PYQ)',
    subtitle: 'UPSC Paper-1 GS & Engg Aptitude',
    badge: '2015-2024 PYQs',
    color: '#f97316',
    gradient: ['#ea580c', '#c2410c'],
    icon: Compass,
    topics: ['PERT & CPM', 'Quality & Six Sigma', 'Engineering Ethics', 'Analytical Ability', 'Energy & Env'],
  },
  {
    id: 'placement',
    title: 'Campus (10-Yr PYQ)',
    subtitle: 'TCS NQT, Infosys, Wipro, Accenture',
    badge: '2015-2024 PYQs',
    color: '#34d399',
    gradient: ['#059669', '#047857'],
    icon: Briefcase,
    topics: ['Ages & Ratios', 'Blood Relations', 'Direction Sense', 'HCF & LCM', 'Syllogisms'],
  },
  {
    id: 'banking',
    title: 'Banking & Govt (10-Yr)',
    subtitle: 'SBI PO, SSC CGL, IBPS, RBI Grade B',
    badge: '2015-2024 PYQs',
    color: '#fbbf24',
    gradient: ['#d97706', '#b45309'],
    icon: Landmark,
    topics: ['Speed Math', 'Missing Series', 'Quadratic Roots', 'Percentages', 'DI Ratios'],
  },
  {
    id: 'all',
    title: 'All Exams (10-Yr Mix)',
    subtitle: 'Universal 10-Yr PYQ Mix Arena',
    badge: '10-Yr PYQ Mix',
    color: '#818cf8',
    gradient: ['#6366f1', '#4f46e5'],
    icon: Brain,
    topics: ['Arithmetic', 'Fractions', 'Percentages', 'Series', 'Logic'],
  },
];

const DIFFICULTIES: {
  key: Difficulty;
  label: string;
  color: string;
  desc: string;
  tag: string;
  meter: number;
}[] = [
  {
    key: 'easy',
    label: 'BEGINNER',
    color: '#10b981',
    desc: 'Foundation math, basic ratios, simple logic & placement screening level.',
    tag: 'TCS / Foundation',
    meter: 1,
  },
  {
    key: 'medium',
    label: 'INTERMEDIATE',
    color: '#f59e0b',
    desc: '2-step word problems, Work-Time, GATE standard PYQs & IBPS PO arithmetic.',
    tag: 'GATE / Bank PO',
    meter: 2,
  },
  {
    key: 'hard',
    label: 'ADVANCED',
    color: '#ef4444',
    desc: 'Complex Permutations, CAT high-order quants, tricky series & hard GATE PYQs.',
    tag: 'CAT 99%ile / Hard',
    meter: 3,
  },
];

const SOLO_CATEGORY_TABS: { id: string; label: string; stageId?: StageId }[] = [
  { id: 'all', label: 'All 30 Levels' },
  { id: 'foundation', label: '🌱 Age 13+ Foundations', stageId: 'foundation' },
  { id: 'core_logic', label: '🔭 Gr 9-10 Core Logic', stageId: 'core_logic' },
  { id: 'campus_placement', label: '💼 Campus Placements', stageId: 'campus_placement' },
  { id: 'banking_govt', label: '🏛️ Banking & Govt', stageId: 'banking_govt' },
  { id: 'gate_ese', label: '⚙️ GATE & ESE', stageId: 'gate_ese' },
  { id: 'cat_elite', label: '👑 CAT 99%ile', stageId: 'cat_elite' },
];

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const {
    examTrack,
    setExamTrack,
    setDifficulty,
    startDuel,
    startSoloBlitz,
    startPractice,
    totalSolved,
    bestStreak,
  } = useGameStore();

  const { profile, settings } = useUserStore();
  const { tasks, getClaimableCount, checkDailyReset, recordMatchOutcome } = useRewardsStore();
  const {
    currentLevel,
    completedLevels,
    levelStars,
    completeLevel,
    activeCategory,
    setActiveCategory,
  } = useSoloStudyStore();

  // Core 3-Feature Tab Selection (Default: 'self_study')
  const [activeFeature, setActiveFeature] = useState<'self_study' | 'compete' | 'practice'>('self_study');

  // Modals
  const [showOnboardingModal, setShowOnboardingModal] = useState(
    !profile.hasCompletedOnboarding && !profile.isLoggedIn
  );
  const [showOnlineLobby, setShowOnlineLobby] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [activeLessonLevel, setActiveLessonLevel] = useState<StudyLevel | null>(null);
  const [activeInfoKey, setActiveInfoKey] = useState<string | null>(null);

  // Question practice selections
  const [practiceTrack, setPracticeTrack] = useState<ExamTrack>('all');
  const [practiceDiff, setPracticeDiff] = useState<Difficulty>('medium');

  // Daily reset check on mount
  useEffect(() => {
    checkDailyReset();
  }, []);

  const claimableCount = getClaimableCount();
  const activeTrackConfig = EXAM_TRACKS.find((t) => t.id === examTrack) || EXAM_TRACKS[0];

  // Current active level object for the Self-Study PLAY button
  const currentStudyLevel =
    SOLO_CURRICULUM.find((l) => l.id === currentLevel) || SOLO_CURRICULUM[0];

  // Filtered levels for the Self-Study pathway
  const filteredLevels =
    activeCategory === 'all'
      ? SOLO_CURRICULUM
      : SOLO_CURRICULUM.filter((lvl) => lvl.stageId === activeCategory);

  const handlePlayCurrentLevel = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setActiveLessonLevel(currentStudyLevel);
  };

  const handleCompleteLesson = (levelId: number, stars: number, xpEarned: number) => {
    completeLevel(levelId, stars, xpEarned);
    recordMatchOutcome('study', 'win', { description: `Completed Level ${levelId}` });
    setActiveLessonLevel(null);
  };

  const handleTrackSelect = (trackId: ExamTrack) => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExamTrack(trackId);
  };

  const handleStartSplitScreenDuel = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDifficulty(practiceDiff);
    startDuel(practiceDiff, examTrack);
    onNavigate('duel');
  };

  const handleStartTimedSprint = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDifficulty(practiceDiff);
    setExamTrack(practiceTrack);
    startSoloBlitz(practiceDiff, practiceTrack);
    onNavigate('solo');
  };

  const handleInviteFriends = async () => {
    try {
      if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const code = profile.referralCode || 'CLASH-2026';
      await Share.share({
        message: `Join me on AptiClash! 🎯 Practice authentic 10-Yr PYQs & challenge me in real-time 1v1 aptitude duels! My invite code: ${code}. Download: https://appticlash.io`,
        title: 'Duel me on AptiClash!',
      });
    } catch (err) {
      console.warn('[Share] Invite share canceled or failed:', err);
    }
  };

  const handleCopyInviteCode = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Invite Code', `Your referral code is: ${profile.referralCode || 'CLASH-2026'}\n\nShare this code with friends to earn +50 PTS!`);
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Onboarding Modal for First Time Open */}
      <AuthOnboardingModal
        visible={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />

      {/* 2. Online Multiplayer Lobby Modal */}
      <OnlineLobbyModal
        visible={showOnlineLobby}
        onClose={() => setShowOnlineLobby(false)}
        onStartMatch={() => onNavigate('online')}
        selectedTrack={examTrack}
        selectedDifficulty={practiceDiff}
      />

      {/* 3. Profile & Settings Drawer Modal */}
      <ProfileMenuModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onNavigate={onNavigate}
      />

      {/* 4. Rewards & Tasks Modal */}
      <DailyRewardsModal
        visible={showDailyRewards}
        onClose={() => setShowDailyRewards(false)}
      />

      {/* 5. Interactive Lesson Modal for Self-Study */}
      <LessonInteractiveModal
        level={activeLessonLevel}
        visible={!!activeLessonLevel}
        onClose={() => setActiveLessonLevel(null)}
        onLevelCompleted={(levelId) => handleCompleteLesson(levelId, 3, 50)}
      />

      {/* 6. Feature Information & Explanation Modal */}
      <FeatureInfoModal
        visible={!!activeInfoKey}
        onClose={() => setActiveInfoKey(null)}
        info={activeInfoKey ? FEATURE_EXPLANATIONS[activeInfoKey] : null}
      />

      {/* ========================================================================= */}
      {/* TOP APP BAR: [Menu Button (Left)]  APTICLASH (Middle)  [Rewards (Right)] */}
      {/* ========================================================================= */}
      <View style={styles.topHeader}>
        {/* LEFT: Menu Button with User Icon & Avatar */}
        <TouchableOpacity
          style={styles.menuTriggerButton}
          onPress={() => {
            if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowProfileMenu(true);
          }}
          activeOpacity={0.75}
          accessibilityLabel="Open Account Menu and Profile"
        >
          <Menu size={18} color="#cbd5e1" />
          <View style={styles.avatarIconRing}>
            <Text style={styles.avatarIconText}>{profile.avatar || '🎓'}</Text>
          </View>
        </TouchableOpacity>

        {/* TOP MIDDLE: Name of the App */}
        <View style={styles.headerCenter}>
          <Text style={styles.brandTitle}>APTICLASH</Text>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.brandSubtitle}>
              {activeFeature === 'self_study'
                ? 'Self-Study Road'
                : activeFeature === 'compete'
                  ? 'Compete Arena'
                  : 'Timed Sprint'}
            </Text>
          </View>
        </View>

        {/* RIGHT: Rewards Points Button */}
        <TouchableOpacity
          style={styles.rewardsTopButton}
          onPress={() => {
            if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowDailyRewards(true);
          }}
          activeOpacity={0.8}
          accessibilityLabel="View Reward Points and Quests"
        >
          <View style={styles.rewardCoinCircle}>
            <Coins size={14} color="#f59e0b" />
          </View>
          <View style={styles.rewardsPointsCol}>
            <Text style={styles.rewardsPointsVal}>{profile.rating || 1200}</Text>
            <Text style={styles.rewardsPointsLabel}>PTS</Text>
          </View>
          {claimableCount > 0 && (
            <View style={styles.claimableBadgeDot}>
              <Text style={styles.claimableBadgeText}>{claimableCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* 3-FEATURE NAVIGATION SWITCHER                                             */}
      {/* 1. Self-Study (Default) | 2. Compete with Friends | 3. Question Practice */}
      {/* ========================================================================= */}
      <View style={styles.featureTabsBar}>
        {/* Feature 1: Self-Study (Default) */}
        <TouchableOpacity
          style={[styles.featureTabBtn, activeFeature === 'self_study' && styles.featureTabBtnActive]}
          onPress={() => {
            if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveFeature('self_study');
          }}
          activeOpacity={0.8}
        >
          <Map
            size={13}
            color={activeFeature === 'self_study' ? '#38bdf8' : '#64748b'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.featureTabBtnText,
              activeFeature === 'self_study' && styles.featureTabBtnTextActive,
            ]}
          >
            Self-Study
          </Text>
          <InfoButton
            size={11}
            color={activeFeature === 'self_study' ? '#38bdf8' : '#64748b'}
            onPress={() => setActiveInfoKey('self_study')}
          />
        </TouchableOpacity>

        {/* Feature 2: Compete with Friends */}
        <TouchableOpacity
          style={[styles.featureTabBtn, activeFeature === 'compete' && styles.featureTabBtnActive]}
          onPress={() => {
            if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveFeature('compete');
          }}
          activeOpacity={0.8}
        >
          <Swords
            size={13}
            color={activeFeature === 'compete' ? '#f472b6' : '#64748b'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.featureTabBtnText,
              activeFeature === 'compete' && styles.featureTabBtnTextActive,
            ]}
          >
            Compete
          </Text>
          <InfoButton
            size={11}
            color={activeFeature === 'compete' ? '#f472b6' : '#64748b'}
            onPress={() => setActiveInfoKey('compete_friends')}
          />
        </TouchableOpacity>

        {/* Feature 3: Question Practice */}
        <TouchableOpacity
          style={[styles.featureTabBtn, activeFeature === 'practice' && styles.featureTabBtnActive]}
          onPress={() => {
            if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveFeature('practice');
          }}
          activeOpacity={0.8}
        >
          <Zap
            size={13}
            color={activeFeature === 'practice' ? '#fbbf24' : '#64748b'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.featureTabBtnText,
              activeFeature === 'practice' && styles.featureTabBtnTextActive,
            ]}
          >
            Practice
          </Text>
          <InfoButton
            size={11}
            color={activeFeature === 'practice' ? '#fbbf24' : '#64748b'}
            onPress={() => setActiveInfoKey('timed_exam_sprint')}
          />
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* FEATURE 1 VIEW: SELF-STUDY (SOLO STUDY PATHWAY - DEFAULT)                */}
      {/* ========================================================================= */}
      {activeFeature === 'self_study' && (
        <View style={styles.selfStudyWrapper}>
          {/* Category Filter Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsScroll}
          >
            {SOLO_CATEGORY_TABS.map((cat) => {
              const isSelected = activeCategory === (cat.stageId || 'all');
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => {
                    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveCategory(cat.stageId || 'all');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Gamified Stepping Stone Roadmap */}
          <MatiksJourneyPath
            levels={filteredLevels}
            currentLevel={currentLevel}
            completedLevels={completedLevels}
            levelStars={levelStars}
            userAvatar={profile.avatar || '🎓'}
            onSelectLevel={(level) => setActiveLessonLevel(level)}
            onInfoPress={() => setActiveInfoKey('self_study')}
          />

          {/* Floating Bottom Action Bar: Big PLAY Button matching reference screenshot */}
          <View style={styles.bottomPlayBar}>
            <View style={styles.playBarInner}>
              {/* Stage level square badge on left */}
              <View style={styles.stageIndicatorSquare}>
                <Text style={styles.stageIndicatorLabel}>LVL</Text>
                <Text style={styles.stageIndicatorNum}>{currentLevel}</Text>
              </View>

              {/* Big prominent PLAY button with Info Icon */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  style={[styles.bigPlayButton, { flex: 1 }]}
                  onPress={handlePlayCurrentLevel}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5', '#3730a3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bigPlayGradient}
                  >
                    <Play size={20} color="#ffffff" fill="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.bigPlayText}>PLAY LEVEL {currentLevel}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <InfoButton
                  size={15}
                  color="#ffffff"
                  onPress={() => setActiveInfoKey('self_study')}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2 VIEW: COMPETE WITH FRIENDS                                     */}
      {/* (Play Online, Play Offline 1v1 Split Screen, Invite Friends, Track)      */}
      {/* ========================================================================= */}
      {activeFeature === 'compete' && (
        <ScrollView contentContainerStyle={styles.featureScroll} showsVerticalScrollIndicator={false}>
          {/* Header Banner */}
          <View style={styles.competeHeaderBox}>
            <View style={styles.featureHeaderBadge}>
              <Swords size={12} color="#f472b6" style={{ marginRight: 5 }} />
              <Text style={styles.featureHeaderBadgeText}>ONLINE & OFFLINE PVP</Text>
            </View>
            <View style={styles.titleWithInfoRow}>
              <Text style={styles.featureTitle}>Compete with Friends</Text>
              <InfoButton color="#f472b6" onPress={() => setActiveInfoKey('compete_friends')} />
            </View>
          </View>

          {/* 1. SELECT EXAM TRACK IN COMPETE WITH FRIENDS */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithInfoRow}>
              <Text style={styles.sectionHeading}>SELECT EXAM TRACK FOR BATTLE</Text>
              <InfoButton size={11} color="#38bdf8" onPress={() => setActiveInfoKey('exam_tracks')} />
            </View>
            <Text style={styles.sectionSubBadge}>{activeTrackConfig.badge}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tracksScroll}
          >
            {EXAM_TRACKS.map((track) => {
              const isSelected = examTrack === track.id;
              const Icon = track.icon;

              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    isSelected && { borderColor: track.color, borderWidth: 1.8 },
                  ]}
                  onPress={() => handleTrackSelect(track.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isSelected ? track.gradient : ['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']
                    }
                    style={styles.trackGradient}
                  >
                    <View style={styles.trackIconBox}>
                      <Icon size={20} color={isSelected ? '#ffffff' : track.color} />
                    </View>
                    <Text style={[styles.trackCardTitle, isSelected && { color: '#ffffff' }]}>
                      {track.title}
                    </Text>
                    <Text
                      style={[
                        styles.trackCardSubtitle,
                        isSelected && { color: 'rgba(255,255,255,0.85)' },
                      ]}
                    >
                      {track.subtitle}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selected Track Topics Chips */}
          <View style={styles.topicsContainer}>
            <View style={styles.topicsHeaderRow}>
              <BookOpen size={13} color="#94a3b8" style={{ marginRight: 6 }} />
              <Text style={styles.topicsLabel}>Duel Syllabus for {activeTrackConfig.title}:</Text>
            </View>
            <View style={styles.topicsChipsRow}>
              {activeTrackConfig.topics.map((topic, i) => (
                <View key={i} style={[styles.topicChip, { borderColor: activeTrackConfig.color + '40' }]}>
                  <Text style={[styles.topicChipText, { color: activeTrackConfig.color }]}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 2. PLAY ONLINE WITH FRIENDS (DEFAULT FEATURED CARD) */}
          <TouchableOpacity
            style={styles.onlineFeaturedCard}
            onPress={() => {
              if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setShowOnlineLobby(true);
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5', '#3730a3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.onlineGradient}
            >
              <View style={styles.onlineBadgeRow}>
                <View style={styles.onlineLiveDot} />
                <Text style={styles.onlineLiveBadge}>PLAY ONLINE WITH FRIENDS</Text>
              </View>

              <View style={styles.onlineMainRow}>
                <View style={styles.onlineIconCircle}>
                  <Globe size={28} color="#ffffff" />
                </View>

                <View style={styles.onlineTextGroup}>
                  <View style={styles.titleWithInfoRow}>
                    <Text style={styles.onlineTitle}>HOST OR JOIN ONLINE ROOM</Text>
                    <InfoButton color="#c7d2fe" onPress={() => setActiveInfoKey('online_duel')} />
                  </View>
                </View>
              </View>

              <View style={styles.onlineActionPillsRow}>
                <View style={styles.actionPill}>
                  <Users size={12} color="#c7d2fe" style={{ marginRight: 4 }} />
                  <Text style={styles.actionPillText}>Room Codes</Text>
                </View>
                <View style={styles.actionPill}>
                  <Zap size={12} color="#c7d2fe" style={{ marginRight: 4 }} />
                  <Text style={styles.actionPillText}>Instant Match</Text>
                </View>
                <View style={[styles.actionPill, styles.actionPillActive]}>
                  <Text style={styles.actionPillActiveText}>Join / Host ➔</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 3. PLAY OFFLINE WITH FRIENDS (1v1 SPLIT SCREEN) */}
          <TouchableOpacity
            style={styles.offlineCard}
            onPress={handleStartSplitScreenDuel}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(244, 114, 182, 0.2)' }]}>
                <Swords size={24} color="#f472b6" />
              </View>

              <View style={styles.modeTextGroup}>
                <View style={styles.modeTitleRow}>
                  <View style={styles.titleWithInfoRow}>
                    <Text style={styles.modeTitle}>PLAY OFFLINE (1v1 SPLIT SCREEN)</Text>
                    <InfoButton color="#f472b6" onPress={() => setActiveInfoKey('offline_split_screen')} />
                  </View>
                  <View style={[styles.modeTag, { backgroundColor: 'rgba(244, 114, 182, 0.25)' }]}>
                    <Text style={[styles.modeTagText, { color: '#f472b6' }]}>SAME PHONE</Text>
                  </View>
                </View>
              </View>

              <ChevronRight size={20} color="#94a3b8" />
            </LinearGradient>
          </TouchableOpacity>

          {/* 4. OPTION TO INVITE FRIENDS WHO ARE NOT YET USING THE APP */}
          <View style={styles.inviteFriendsCard}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.18)', 'rgba(234, 88, 12, 0.08)']}
              style={styles.inviteGradient}
            >
              <View style={styles.inviteHeaderRow}>
                <View style={styles.inviteIconBox}>
                  <Share2 size={20} color="#fbbf24" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleWithInfoRow}>
                    <Text style={styles.inviteTitle}>Invite Friends to ApptiClash</Text>
                    <InfoButton color="#fbbf24" onPress={() => setActiveInfoKey('invite_friends')} />
                  </View>
                </View>
              </View>

              <View style={styles.referralCodeBox}>
                <View>
                  <Text style={styles.referralCodeLabel}>YOUR INVITE CODE</Text>
                  <Text style={styles.referralCodeVal}>{profile.referralCode || 'CLASH-2026'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.copyCodeBtn}
                  onPress={handleCopyInviteCode}
                  activeOpacity={0.75}
                >
                  <Copy size={13} color="#fbbf24" style={{ marginRight: 4 }} />
                  <Text style={styles.copyCodeBtnText}>Copy Code</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.shareInviteBtn}
                onPress={handleInviteFriends}
                activeOpacity={0.85}
              >
                <Share2 size={16} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={styles.shareInviteBtnText}>Share Invite Link with Friends ➔</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3 VIEW: QUESTION PRACTICE (TIMED EXAM SPRINT)                     */}
      {/* (Specific Exam Oriented or Miscellaneous All-Exams Option)                */}
      {/* ========================================================================= */}
      {activeFeature === 'practice' && (
        <ScrollView contentContainerStyle={styles.featureScroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.practiceHeaderBox}>
            <View style={styles.practiceBadge}>
              <Zap size={12} color="#fbbf24" style={{ marginRight: 5 }} />
              <Text style={styles.practiceBadgeText}>TIMED EXAM SPRINT</Text>
            </View>
            <View style={styles.titleWithInfoRow}>
              <Text style={styles.featureTitle}>Question Practice</Text>
              <InfoButton color="#fbbf24" onPress={() => setActiveInfoKey('timed_exam_sprint')} />
            </View>
          </View>

          {/* 1. SELECT EXAM TRACK (SPECIFIC OR MISCELLANEOUS) */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithInfoRow}>
              <Text style={styles.sectionHeading}>SELECT PRACTICE TRACK</Text>
              <InfoButton size={11} color="#fbbf24" onPress={() => setActiveInfoKey('exam_tracks')} />
            </View>
            <Text style={styles.sectionSubBadge}>
              {practiceTrack === 'all' ? 'Universal Mix' : 'Exam-Specific'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tracksScroll}
          >
            {EXAM_TRACKS.map((track) => {
              const isSelected = practiceTrack === track.id;
              const Icon = track.icon;
              const isMisc = track.id === 'all';

              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    isSelected && { borderColor: track.color, borderWidth: 1.8 },
                  ]}
                  onPress={() => {
                    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPracticeTrack(track.id);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isSelected ? track.gradient : ['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']
                    }
                    style={styles.trackGradient}
                  >
                    <View style={styles.trackIconBox}>
                      <Icon size={20} color={isSelected ? '#ffffff' : track.color} />
                    </View>
                    <Text style={[styles.trackCardTitle, isSelected && { color: '#ffffff' }]}>
                      {track.title}
                    </Text>
                    <Text
                      style={[
                        styles.trackCardSubtitle,
                        isSelected && { color: 'rgba(255,255,255,0.85)' },
                      ]}
                    >
                      {isMisc ? '✨ Miscellaneous Mix' : track.subtitle}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 2. SELECT PACING & DIFFICULTY */}
          <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
            <Text style={styles.sectionHeading}>SELECT PACING & DIFFICULTY</Text>
          </View>

          <View style={styles.diffCardsCol}>
            {DIFFICULTIES.map((diff) => {
              const isSelected = practiceDiff === diff.key;

              return (
                <TouchableOpacity
                  key={diff.key}
                  style={[
                    styles.practiceDiffCard,
                    isSelected && { borderColor: diff.color, borderWidth: 1.8 },
                  ]}
                  onPress={() => {
                    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setPracticeDiff(diff.key);
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[
                      isSelected ? diff.color + '25' : 'rgba(30, 41, 59, 0.6)',
                      'rgba(15, 23, 42, 0.8)',
                    ]}
                    style={styles.diffCardGradient}
                  >
                    <View style={styles.diffCardTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.diffCardLabel, { color: diff.color }]}>
                          {diff.label}
                        </Text>
                        <View style={[styles.diffCardBadge, { backgroundColor: diff.color + '20' }]}>
                          <Text style={[styles.diffCardBadgeText, { color: diff.color }]}>
                            {diff.tag}
                          </Text>
                        </View>
                        <InfoButton
                          size={11}
                          color={diff.color}
                          onPress={() => setActiveInfoKey(`diff_${diff.key}`)}
                        />
                      </View>

                      {isSelected && <Check size={18} color={diff.color} />}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. START SPRINT BUTTON */}
          <TouchableOpacity
            style={styles.startSprintBtn}
            onPress={handleStartTimedSprint}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#be185d', '#ec4899', '#831843']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startSprintGradient}
            >
              <Zap size={22} color="#ffffff" />
              <View style={{ flex: 1 }}>
                <View style={styles.titleWithInfoRow}>
                  <Text style={styles.startSprintTitle}>START 10-QUESTION SPRINT</Text>
                  <InfoButton size={12} color="#ffffff" onPress={() => setActiveInfoKey('timed_exam_sprint')} />
                </View>
                <Text style={styles.startSprintSub}>
                  {practiceTrack === 'all'
                    ? 'Universal 10-Yr PYQ Mix'
                    : `${practiceTrack.toUpperCase()} 10-Yr PYQs`}{' '}
                  • {practiceDiff.toUpperCase()} PACE
                </Text>
              </View>
              <ArrowRight size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ===================================================
  // TOP APP BAR STYLES
  // ===================================================
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    gap: 6,
  },
  avatarIconRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#818cf8',
  },
  avatarIconText: {
    fontSize: 14,
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  rewardsTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    gap: 5,
    position: 'relative',
  },
  rewardCoinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsPointsCol: {
    alignItems: 'flex-start',
  },
  rewardsPointsVal: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  rewardsPointsLabel: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 10,
  },
  claimableBadgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  claimableBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },

  // ===================================================
  // 3-FEATURE TABS BAR
  // ===================================================
  featureTabsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  featureTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureTabBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  featureTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  featureTabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // ===================================================
  // FEATURE 1: SELF-STUDY STYLES
  // ===================================================
  selfStudyWrapper: {
    flex: 1,
    position: 'relative',
  },
  categoryPillsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  categoryPillTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  bottomPlayBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    zIndex: 100,
  },
  playBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stageIndicatorSquare: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  stageIndicatorLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
  },
  stageIndicatorNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#38bdf8',
  },
  bigPlayButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#818cf8',
  },
  bigPlayGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigPlayText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ===================================================
  // FEATURE 2 & 3 COMMON SCROLL CONTENT
  // ===================================================
  featureScroll: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  competeHeaderBox: {
    marginBottom: 20,
  },
  practiceHeaderBox: {
    marginBottom: 20,
  },
  featureHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.3)',
  },
  featureHeaderBadgeText: {
    color: '#f472b6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  practiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  practiceBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  featureDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  // ===================================================
  // TRACK SELECTOR & TOPICS
  // ===================================================
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.2,
  },
  sectionSubBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818cf8',
  },
  tracksScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  trackCard: {
    width: 144,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackGradient: {
    padding: 14,
    height: 125,
    justifyContent: 'space-between',
  },
  trackIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  trackCardSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    lineHeight: 14,
  },
  topicsContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  topicsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicsLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  topicsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ===================================================
  // COMPETE MODE CARDS
  // ===================================================
  onlineFeaturedCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#818cf8',
    marginBottom: 16,
  },
  onlineGradient: {
    padding: 18,
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  onlineLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    marginRight: 6,
  },
  onlineLiveBadge: {
    color: '#c7d2fe',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  onlineMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  onlineIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineTextGroup: {
    flex: 1,
  },
  onlineTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  onlineDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
  onlineActionPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  actionPillText: {
    color: '#e0e7ff',
    fontSize: 10,
    fontWeight: '700',
  },
  actionPillActive: {
    backgroundColor: '#ffffff',
    marginLeft: 'auto',
  },
  actionPillActiveText: {
    color: '#4338ca',
    fontSize: 10,
    fontWeight: '900',
  },
  offlineCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.3)',
    marginBottom: 16,
  },
  modeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  modeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTextGroup: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeDesc: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },

  // ===================================================
  // INVITE FRIENDS CARD
  // ===================================================
  inviteFriendsCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: 20,
  },
  inviteGradient: {
    padding: 16,
  },
  inviteHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inviteIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  inviteDesc: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  referralCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  referralCodeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  referralCodeVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 1,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  copyCodeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fbbf24',
  },
  shareInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingVertical: 11,
  },
  shareInviteBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.3,
  },

  // ===================================================
  // PRACTICE TIMED SPRINT STYLES
  // ===================================================
  diffCardsCol: {
    gap: 10,
    marginBottom: 20,
  },
  practiceDiffCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  diffCardGradient: {
    padding: 14,
  },
  diffCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  diffCardLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  diffCardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffCardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  diffCardPacing: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
    fontWeight: '500',
  },
  startSprintBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#be185d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ec4899',
  },
  startSprintGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  startSprintTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  startSprintSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  titleWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
