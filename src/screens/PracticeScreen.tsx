import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Flame, Zap, Map, Layers, Sparkles, Play, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useSoloStudyStore } from '../store/useSoloStudyStore';
import { useUserStore } from '../store/useUserStore';
import { SOLO_CURRICULUM, STUDY_STAGES } from '../data/soloCurriculum';
import { StudyLevel, StageId } from '../types/soloStudy';
import { MatiksJourneyPath } from '../components/solo/MatiksJourneyPath';
import { BrilliantCourseList } from '../components/solo/BrilliantCourseList';
import { LessonInteractiveModal } from '../components/solo/LessonInteractiveModal';

const CATEGORY_TABS: { id: string; label: string; stageId?: StageId }[] = [
  { id: 'all', label: 'All Levels (1–30)' },
  { id: 'foundation', label: '🌱 Age 13+ Foundations', stageId: 'foundation' },
  { id: 'core_logic', label: '🔭 Gr 9-10 Core Logic', stageId: 'core_logic' },
  { id: 'campus_placement', label: '💼 Campus Placements', stageId: 'campus_placement' },
  { id: 'banking_govt', label: '🏛️ Banking & Govt', stageId: 'banking_govt' },
  { id: 'gate_ese', label: '⚙️ GATE & ESE', stageId: 'gate_ese' },
  { id: 'cat_elite', label: '👑 CAT 99%ile Pinnacle', stageId: 'cat_elite' },
];

export default function PracticeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const {
    currentLevel,
    completedLevels,
    levelStars,
    totalXp,
    streak,
    viewMode,
    activeCategory,
    setViewMode,
    setActiveCategory,
  } = useSoloStudyStore();

  const [activeModalLevel, setActiveModalLevel] = useState<StudyLevel | null>(null);

  // Filter levels based on selected category tab
  const filteredLevels = useMemo(() => {
    if (activeCategory === 'all') return SOLO_CURRICULUM;
    return SOLO_CURRICULUM.filter((lvl) => lvl.stageId === activeCategory);
  }, [activeCategory]);

  // Current level data object
  const currentLevelData = useMemo(() => {
    return SOLO_CURRICULUM.find((lvl) => lvl.id === currentLevel) || SOLO_CURRICULUM[0];
  }, [currentLevel]);

  const handleSelectLevel = (level: StudyLevel) => {
    setActiveModalLevel(level);
  };

  const handleContinueLearning = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setActiveModalLevel(currentLevelData);
  };

  const handleTabPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveCategory(categoryId);
  };

  const toggleViewMode = (mode: 'journey' | 'courses') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setViewMode(mode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1D" />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={20} color="#F8FAFC" />
          </TouchableOpacity>
          <View>
            <Text style={styles.topBarTitle}>Solo Study</Text>
            <Text style={styles.topBarSub}>Foundations to CAT 99%ile</Text>
          </View>
        </View>

        {/* Stats & Streak Chips */}
        <View style={styles.topBarRight}>
          <View style={styles.statChip}>
            <Flame size={14} color="#F97316" />
            <Text style={styles.statChipText}>{streak}d</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Zap size={14} color="#F59E0B" />
            <Text style={[styles.statChipText, { color: '#F59E0B' }]}>{totalXp}</Text>
          </View>
        </View>
      </View>

      {/* Mode Switcher: Matiks Journey vs Brilliant Courses */}
      <View style={styles.modeSwitcherRow}>
        <View style={styles.modeSwitcherContainer}>
          <TouchableOpacity
            style={[styles.modeTab, viewMode === 'journey' && styles.modeTabActive]}
            onPress={() => toggleViewMode('journey')}
            activeOpacity={0.8}
          >
            <Map size={16} color={viewMode === 'journey' ? '#06B6D4' : '#94A3B8'} />
            <Text style={[styles.modeTabText, viewMode === 'journey' && styles.modeTabTextActive]}>
              Journey Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, viewMode === 'courses' && styles.modeTabActive]}
            onPress={() => toggleViewMode('courses')}
            activeOpacity={0.8}
          >
            <Layers size={16} color={viewMode === 'courses' ? '#06B6D4' : '#94A3B8'} />
            <Text style={[styles.modeTabText, viewMode === 'courses' && styles.modeTabTextActive]}>
              Curriculum List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Tab Bar */}
      <View style={styles.categoryScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Body: Journey Map or Curriculum List */}
      <View style={styles.contentArea}>
        {viewMode === 'journey' ? (
          <MatiksJourneyPath
            levels={filteredLevels}
            currentLevel={currentLevel}
            completedLevels={completedLevels}
            levelStars={levelStars}
            userAvatar={profile.avatar}
            onSelectLevel={handleSelectLevel}
          />
        ) : (
          <BrilliantCourseList
            levels={filteredLevels}
            currentLevel={currentLevel}
            completedLevels={completedLevels}
            levelStars={levelStars}
            onSelectLevel={handleSelectLevel}
          />
        )}
      </View>

      {/* Bottom Floating Thumb-Zone Action Bar (Matiks Style) */}
      <View style={styles.floatingBottomBar}>
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.96)', 'rgba(10, 15, 29, 0.98)']}
          style={styles.floatingBarInner}
        >
          <View style={styles.floatingBarLeft}>
            <Text style={styles.floatingBarTag}>NEXT UP • LEVEL {currentLevelData.id}</Text>
            <Text style={styles.floatingBarTitle} numberOfLines={1}>
              {currentLevelData.title}
            </Text>
            <Text style={styles.floatingBarSub} numberOfLines={1}>
              {currentLevelData.gradeTag} • +{currentLevelData.xpReward} XP
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinueLearning}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#06B6D4', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueBtnGradient}
            >
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.continueBtnText}>LEARN</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Interactive Lesson Modal */}
      <LessonInteractiveModal
        level={activeModalLevel}
        visible={!!activeModalLevel}
        onClose={() => setActiveModalLevel(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  topBarSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  statChipText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '800',
  },
  modeSwitcherRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  categoryScrollWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 8,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06B6D4',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  contentArea: {
    flex: 1,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  floatingBarLeft: {
    flex: 1,
    marginRight: 12,
  },
  floatingBarTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 0.6,
  },
  floatingBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  floatingBarSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  continueBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
