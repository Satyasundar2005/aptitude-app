import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
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
  Wifi,
  Menu,
  User,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { Difficulty, ExamTrack } from '../types/game';
import OnlineLobbyModal from './OnlineLobbyModal';
import ProfileMenuModal from '../components/ProfileMenuModal';

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
    topics: [
      'Work & Time',
      'Speed & Distance',
      'Probability',
      'Spatial & Geometry',
      'Modular Math',
    ],
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
    topics: [
      'Quant Comparison',
      'Data Interpretation',
      'Algebra & Word',
      'Geometry',
      'Number Properties',
    ],
  },
  {
    id: 'ese',
    title: 'ESE / IES (10-Yr PYQ)',
    subtitle: 'UPSC Paper-1 GS & Engg Aptitude',
    badge: '2015-2024 PYQs',
    color: '#f97316',
    gradient: ['#ea580c', '#c2410c'],
    icon: Compass,
    topics: [
      'PERT & CPM',
      'Quality & Six Sigma',
      'Engineering Ethics',
      'Analytical Ability',
      'Energy & Env',
    ],
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
  const [selectingFor, setSelectingFor] = useState<'duel' | 'solo' | 'practice' | null>(null);
  const [showOnlineLobby, setShowOnlineLobby] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeTrack = EXAM_TRACKS.find((t) => t.id === examTrack) || EXAM_TRACKS[0];

  const handleTrackSelect = (trackId: ExamTrack) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExamTrack(trackId);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDifficulty(diff);
    if (selectingFor === 'duel') {
      startDuel(diff, examTrack);
      onNavigate('duel');
    } else if (selectingFor === 'solo') {
      startSoloBlitz(diff, examTrack);
      onNavigate('solo');
    } else {
      startPractice(diff, examTrack);
      onNavigate('practice');
    }
    setSelectingFor(null);
  };

  // DIFFICULTY SELECTION VIEW
  if (selectingFor) {
    const modeTitle =
      selectingFor === 'duel'
        ? 'OFFLINE 1v1 SPLIT SCREEN'
        : selectingFor === 'solo'
          ? 'TIMED EXAM SPRINT (10-YR PYQs)'
          : 'EXAM PRACTICE & 10-YR PYQ DRILL';

    const ModeIcon = selectingFor === 'duel' ? Swords : selectingFor === 'solo' ? Zap : BookOpen;

    return (
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.difficultyScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.diffHeaderSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectingFor(null);
              }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color="#94a3b8" />
              <Text style={styles.backLabel}>Back</Text>
            </TouchableOpacity>

            <View style={styles.selectedTrackPill}>
              <activeTrack.icon size={13} color={activeTrack.color} style={{ marginRight: 5 }} />
              <Text style={[styles.selectedTrackPillText, { color: activeTrack.color }]}>
                {activeTrack.title}
              </Text>
            </View>
          </View>

          <View style={styles.diffTitleBlock}>
            <View style={styles.modeIndicatorRow}>
              <ModeIcon size={20} color="#818cf8" style={{ marginRight: 8 }} />
              <Text style={styles.modeSubtitle}>{modeTitle}</Text>
            </View>
            <Text style={styles.sectionTitle}>Select Pacing & Difficulty</Text>
            <Text style={styles.sectionDesc}>
              {selectingFor === 'practice'
                ? `Practicing authentic 10-year ${activeTrack.title} PYQs with step-by-step solutions and official paper citations.`
                : selectingFor === 'solo'
                  ? `10 authentic PYQs under real exam pacing. Timer per question dictates pressure.`
                  : `Questions will be pulled from 10-year ${activeTrack.title} papers matched to your difficulty.`}
            </Text>
          </View>

          {/* Difficulty Cards */}
          <View style={styles.difficultyList}>
            {DIFFICULTIES.map((diff) => {
              const soloPacing =
                diff.key === 'easy'
                  ? '60s / question • Foundation level • 10 Questions'
                  : diff.key === 'medium'
                    ? '45s / question • GATE & GRE pace • 10 Questions'
                    : '30s / question • CAT QA & Bank sprint • 10 Questions';

              const soloTag =
                diff.key === 'easy'
                  ? '60s / Q (Easy)'
                  : diff.key === 'medium'
                    ? '45s / Q (Medium)'
                    : '30s / Q (Hard)';

              return (
                <TouchableOpacity
                  key={diff.key}
                  style={[styles.difficultyCard, { borderColor: diff.color + '60' }]}
                  onPress={() => handleDifficultySelect(diff.key)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[diff.color + '20', diff.color + '06']}
                    style={styles.difficultyGradient}
                  >
                    <View style={styles.diffHeaderRow}>
                      <View style={styles.diffNameGroup}>
                        <Text style={[styles.difficultyLabel, { color: diff.color }]}>
                          {diff.label}
                        </Text>
                        <View style={[styles.diffTagBadge, { backgroundColor: diff.color + '20' }]}>
                          <Text style={[styles.diffTagText, { color: diff.color }]}>
                            {selectingFor === 'solo' ? soloTag : diff.tag}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.meterContainer}>
                        {[1, 2, 3].map((i) => (
                          <View
                            key={i}
                            style={[
                              styles.meterBar,
                              { backgroundColor: i <= diff.meter ? diff.color : '#334155' },
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    <Text style={styles.difficultyDesc}>
                      {selectingFor === 'solo' ? soloPacing : diff.desc}
                    </Text>

                    <View style={styles.startRow}>
                      <Text style={[styles.startText, { color: diff.color }]}>
                        {selectingFor === 'practice'
                          ? 'Start Practice'
                          : selectingFor === 'solo'
                            ? 'Start 10-Q Sprint'
                            : 'Tap to Begin'}
                      </Text>
                      <ChevronRight size={16} color={diff.color} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // MAIN HOME VIEW
  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <StatusBar style="light" />

      {/* Online Room Lobby Modal */}
      <OnlineLobbyModal
        visible={showOnlineLobby}
        onClose={() => setShowOnlineLobby(false)}
        onStartMatch={() => onNavigate('online')}
        selectedTrack={examTrack}
        selectedDifficulty="medium"
      />

      {/* Profile, Settings & Account Drawer Modal */}
      <ProfileMenuModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onNavigate={onNavigate}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top App Bar with Top-Left Menu Option, Branding and Stats */}
        <View style={styles.topHeader}>
          {/* Top-Left Menu Option with User Icon / Avatar */}
          <View style={styles.topLeftGroup}>
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

            <View style={styles.brandTextGroup}>
              <Text style={styles.brandTitle}>APTICLASH</Text>
              <Text style={styles.brandSubtitle}>
                {profile.isLoggedIn ? `Hi, ${profile.name.split(' ')[0]}` : 'Aptitude Duels'}
              </Text>
            </View>
          </View>

          {/* Quick Stats Pill */}
          <TouchableOpacity
            style={styles.statsPill}
            onPress={() => {
              if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowProfileMenu(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.statItem}>
              <CheckCircle2 size={13} color="#10b981" />
              <Text style={styles.statValue}>{totalSolved}</Text>
              <Text style={styles.statLabel}>Solved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Flame size={13} color="#f59e0b" />
              <Text style={styles.statValue}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.25)', 'rgba(30, 27, 75, 0.4)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroBadge}>
              <Sparkles size={12} color="#f59e0b" style={{ marginRight: 4 }} />
              <Text style={styles.heroBadgeText}>GATE • CAT • ESE • PLACEMENTS • BANK</Text>
            </View>
            <Text style={styles.heroTitle}>Duel With Friends Online or Offline</Text>
            <Text style={styles.heroDesc}>
              Play online with friends via room codes, duel face-to-face on one device offline, or
              drill PYQs solo.
            </Text>
          </LinearGradient>
        </View>

        {/* Target Exam Track Selector */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>SELECT EXAM TRACK</Text>
          <Text style={styles.sectionSubBadge}>{activeTrack.badge}</Text>
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

        {/* Selected Track Topics Chips & Quick Practice Launch */}
        <View style={styles.topicsContainer}>
          <View style={styles.topicsHeaderRow}>
            <BookOpen size={13} color="#94a3b8" style={{ marginRight: 6 }} />
            <Text style={styles.topicsLabel}>Curriculum for {activeTrack.title}:</Text>
          </View>
          <View style={styles.topicsChipsRow}>
            {activeTrack.topics.map((topic, i) => (
              <View key={i} style={[styles.topicChip, { borderColor: activeTrack.color + '40' }]}>
                <Text style={[styles.topicChipText, { color: activeTrack.color }]}>{topic}</Text>
              </View>
            ))}
          </View>

          {/* Quick Practice Trigger Button */}
          <TouchableOpacity
            style={[
              styles.quickPracticeBtn,
              { backgroundColor: activeTrack.color + '20', borderColor: activeTrack.color + '50' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onNavigate('practice');
            }}
            activeOpacity={0.8}
          >
            <Target size={15} color={activeTrack.color} />
            <Text style={[styles.quickPracticeText, { color: activeTrack.color }]}>
              Solo Study Pathway: Age 13+ to CAT 99%ile
            </Text>
            <ArrowRight size={14} color={activeTrack.color} />
          </TouchableOpacity>
        </View>

        {/* Game Mode Cards */}
        <View style={styles.modesSection}>
          <Text style={styles.sectionHeading}>CHOOSE BATTLE MODE</Text>

          {/* 🌐 1. ONLINE MULTIPLAYER WITH FRIENDS (DEFAULT) */}
          <TouchableOpacity
            style={styles.onlineFeaturedCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
                <Text style={styles.onlineLiveBadge}>ONLINE MULTIPLAYER • DEFAULT</Text>
              </View>

              <View style={styles.onlineMainRow}>
                <View style={styles.onlineIconCircle}>
                  <Globe size={30} color="#ffffff" />
                </View>

                <View style={styles.onlineTextGroup}>
                  <Text style={styles.onlineTitle}>PLAY ONLINE WITH FRIENDS</Text>
                  <Text style={styles.onlineDesc}>
                    Create a private room, share room code with your friends, or match against live
                    online rivals in {activeTrack.title}!
                  </Text>
                </View>
              </View>

              {/* Action Pills */}
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

          {/* 📱 2. OFFLINE 1v1 SPLIT SCREEN (PRESERVED ON SAME DEVICE) */}
          <TouchableOpacity
            style={styles.offlineCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectingFor('duel');
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View
                style={[styles.modeIconCircle, { backgroundColor: 'rgba(244, 114, 182, 0.2)' }]}
              >
                <Swords size={24} color="#f472b6" />
              </View>

              <View style={styles.modeTextGroup}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>1v1 SPLIT SCREEN (OFFLINE)</Text>
                  <View style={[styles.modeTag, { backgroundColor: 'rgba(244, 114, 182, 0.25)' }]}>
                    <Text style={[styles.modeTagText, { color: '#f472b6' }]}>SAME DEVICE</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Play with friends offline on one phone or tablet. Dual-rotated screen for
                  face-to-face tabletop dueling.
                </Text>
              </View>

              <ChevronRight size={20} color="#94a3b8" />
            </LinearGradient>
          </TouchableOpacity>

          {/* 🎯 3. SOLO STUDY PATHWAY (BRILLIANT / MATIKS STYLE) */}
          <TouchableOpacity
            style={styles.practiceCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onNavigate('practice');
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0284c7', '#0369a1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View
                style={[styles.modeIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}
              >
                <BookOpen size={24} color="#ffffff" />
              </View>

              <View style={styles.modeTextGroup}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>SOLO STUDY PATHWAY</Text>
                  <View style={[styles.modeTag, { backgroundColor: '#38bdf8' }]}>
                    <Text style={[styles.modeTagText, { color: '#0f172a' }]}>
                      BRILLIANT & MATIKS
                    </Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Learn Aptitude & Reasoning from age 13 basics to CAT 99%ile step-by-step. 30
                  progressive levels with mental models, intuition & 10-Yr PYQs.
                </Text>
              </View>

              <ChevronRight size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* ⚡ 4. TIMED EXAM SPRINT (GATE • CAT • GRE) */}
          <TouchableOpacity
            style={styles.blitzCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectingFor('solo');
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#be185d', '#831843']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modeCardGradient}
            >
              <View
                style={[styles.modeIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              >
                <Zap size={24} color="#ffffff" />
              </View>

              <View style={styles.modeTextGroup}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>TIMED EXAM SPRINT</Text>
                  <View style={[styles.modeTag, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                    <Text style={styles.modeTagText}>10 QUESTIONS</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Single-player test simulator under strict GATE/CAT/GRE time limits (30s / 45s /
                  60s per Q). Review solutions at the end!
                </Text>
              </View>

              <ChevronRight size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>APTICLASH 2026</Text>
          <Text style={styles.footerText}>
            Online Multiplayer & Offline Split-Screen for GATE, CAT, ESE & Placements.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 54,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 6,
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
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  heroGradient: {
    padding: 18,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  heroBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
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
    marginTop: 14,
    marginBottom: 24,
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
    marginBottom: 12,
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
  quickPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  quickPracticeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modesSection: {
    gap: 16,
    marginBottom: 28,
  },
  // ONLINE FEATURED CARD (DEFAULT)
  onlineFeaturedCard: {
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#818cf8',
  },
  onlineGradient: {
    padding: 20,
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    gap: 16,
    marginBottom: 16,
  },
  onlineIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineTextGroup: {
    flex: 1,
  },
  onlineTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  onlineDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  onlineActionPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionPillText: {
    color: '#e0e7ff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionPillActive: {
    backgroundColor: '#ffffff',
    marginLeft: 'auto',
  },
  actionPillActiveText: {
    color: '#4338ca',
    fontSize: 11,
    fontWeight: '900',
  },
  // OFFLINE CARD
  offlineCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.3)',
  },
  practiceCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  blitzCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  modeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  modeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 15,
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
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerBrand: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  // DIFFICULTY VIEW STYLES
  difficultyScroll: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  diffHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLabel: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedTrackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedTrackPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  diffTitleBlock: {
    marginBottom: 24,
  },
  modeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modeSubtitle: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  sectionDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  difficultyList: {
    gap: 16,
  },
  difficultyCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  difficultyGradient: {
    padding: 20,
  },
  diffHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  diffNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyLabel: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  diffTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  meterContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  meterBar: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  difficultyDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 14,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
