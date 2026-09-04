import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  Lock,
  Star,
  Zap,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { StudyLevel } from '../../types/soloStudy';

interface Props {
  levels: StudyLevel[];
  currentLevel: number;
  completedLevels: number[];
  levelStars: Record<number, number>;
  onSelectLevel: (level: StudyLevel) => void;
}

// Geometric icon mapping for Brilliant card styling
const GEOMETRIC_ICONS: Record<string, string> = {
  shapes: '📐',
  clock: '⏱️',
  dice: '🎲',
  calculator: '🔢',
  lightbulb: '💡',
  zap: '⚡',
  compass: '🧭',
  target: '🎯',
  trophy: '🏆',
  crown: '👑',
};

export const BrilliantCourseList: React.FC<Props> = ({
  levels,
  currentLevel,
  completedLevels,
  levelStars,
  onSelectLevel,
}) => {
  const completedSet = new Set(completedLevels);

  const handleCardPress = (level: StudyLevel, isLocked: boolean) => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSelectLevel(level);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.listContainer}>
        {/* Continuous Left Vertical Track Line */}
        <View style={styles.verticalTrack} />

        {levels.map((level, idx) => {
          const isCompleted = completedSet.has(level.id);
          const isCurrent = level.id === currentLevel;
          const isUnlocked = isCompleted || isCurrent || level.id <= currentLevel;
          const isLocked = !isUnlocked;
          const stars = levelStars[level.id] || 0;
          const isNew = isCurrent && !isCompleted;
          const iconEmoji = GEOMETRIC_ICONS[level.iconType] || '🧠';

          return (
            <View key={level.id} style={styles.courseRow}>
              {/* Left Timeline Node Hub */}
              <View style={styles.nodeHub}>
                <View
                  style={[
                    styles.nodeDot,
                    isCompleted && styles.nodeDotCompleted,
                    isCurrent && styles.nodeDotCurrent,
                    isLocked && styles.nodeDotLocked,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} color="#10B981" />
                  ) : isLocked ? (
                    <Lock size={12} color="#64748B" />
                  ) : (
                    <View style={styles.nodeInnerPulse} />
                  )}
                </View>
              </View>

              {/* Brilliant-style Dark Geometric Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.card,
                  isCurrent && styles.cardCurrent,
                  isLocked && styles.cardLocked,
                ]}
                onPress={() => handleCardPress(level, isLocked)}
              >
                <View style={styles.cardHeader}>
                  {/* Left Geometric Icon Box */}
                  <LinearGradient colors={level.gradientColors} style={styles.iconBox}>
                    <Text style={styles.iconBoxEmoji}>{iconEmoji}</Text>
                  </LinearGradient>

                  {/* Badges */}
                  <View style={styles.metaBadges}>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>{level.gradeTag}</Text>
                    </View>
                    {isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Title and Subtitle */}
                <Text
                  style={[
                    styles.levelTitle,
                    isCurrent && styles.levelTitleCurrent,
                    isLocked && styles.levelTitleLocked,
                  ]}
                  numberOfLines={2}
                >
                  {level.id}. {level.title}
                </Text>
                <Text
                  style={[styles.levelSubtitle, isLocked && styles.levelSubtitleLocked]}
                  numberOfLines={2}
                >
                  {level.subtitle}
                </Text>

                {/* Footer Meta Row */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterLeft}>
                    <View style={styles.xpPill}>
                      <Zap size={12} color="#F59E0B" />
                      <Text style={styles.xpPillText}>+{level.xpReward} XP</Text>
                    </View>
                    <View style={styles.lessonCountPill}>
                      <BookOpen size={12} color="#94A3B8" />
                      <Text style={styles.lessonCountText}>
                        {level.questions.length} Challenges
                      </Text>
                    </View>
                  </View>

                  {/* Status / Action Indicator */}
                  {isCompleted ? (
                    <View style={styles.starsRow}>
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          color={s <= stars ? '#F59E0B' : '#475569'}
                          fill={s <= stars ? '#F59E0B' : 'transparent'}
                        />
                      ))}
                    </View>
                  ) : isCurrent ? (
                    <View style={styles.startPill}>
                      <Text style={styles.startPillText}>Start</Text>
                      <ChevronRight size={14} color="#06B6D4" />
                    </View>
                  ) : (
                    <ChevronRight size={18} color="#475569" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 130,
    paddingTop: 10,
  },
  listContainer: {
    position: 'relative',
    paddingHorizontal: 16,
  },
  verticalTrack: {
    position: 'absolute',
    left: 31,
    top: 20,
    bottom: 40,
    width: 2,
    backgroundColor: '#1E293B',
    zIndex: 0,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    zIndex: 1,
  },
  nodeHub: {
    width: 32,
    alignItems: 'center',
    paddingTop: 24,
  },
  nodeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  nodeDotCompleted: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  nodeDotCurrent: {
    borderColor: '#06B6D4',
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
  },
  nodeDotLocked: {
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  nodeInnerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06B6D4',
  },
  card: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCurrent: {
    borderColor: 'rgba(6, 182, 212, 0.5)',
    backgroundColor: '#131E35',
    shadowColor: '#06B6D4',
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxEmoji: {
    fontSize: 22,
  },
  metaBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 22,
    marginBottom: 4,
  },
  levelTitleCurrent: {
    color: '#38BDF8',
  },
  levelTitleLocked: {
    color: '#64748B',
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  levelSubtitleLocked: {
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 10,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  lessonCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  startPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  startPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06B6D4',
  },
});
