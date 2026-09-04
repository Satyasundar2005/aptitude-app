import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lock,
  Check,
  Star,
  Sparkles,
  Compass,
  Trophy,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { StudyLevel } from '../../types/soloStudy';
import { STUDY_STAGES } from '../../data/soloCurriculum';
import { InfoButton } from '../common/InfoButton';

const { width } = Dimensions.get('window');

interface Props {
  levels: StudyLevel[];
  currentLevel: number;
  completedLevels: number[];
  levelStars: Record<number, number>;
  userAvatar?: string;
  onSelectLevel: (level: StudyLevel) => void;
  onInfoPress?: () => void;
}

// Visual props/decorations placed along the journey map
const STAGE_DECORATIONS: Record<number, { icon: string; title: string; subtitle: string }> = {
  1: { icon: '🌱', title: 'Beginner Forest', subtitle: 'First steps into logic' },
  6: { icon: '🔭', title: 'Observatory Hill', subtitle: 'High school core math' },
  11: { icon: '🏢', title: 'Corporate Arena', subtitle: 'Placement PYQs' },
  16: { icon: '🏛️', title: 'Grand Treasury', subtitle: 'Banking speed & accuracy' },
  21: { icon: '⚡', title: 'Engineering Nexus', subtitle: 'GATE & ESE algorithms' },
  26: { icon: '👑', title: 'Olympus Summit', subtitle: 'CAT 99th percentile gauntlet' },
};

export const MatiksJourneyPath: React.FC<Props> = ({
  levels,
  currentLevel,
  completedLevels,
  levelStars,
  userAvatar = '🎓',
  onSelectLevel,
  onInfoPress,
}) => {
  const completedSet = new Set(completedLevels);

  // Compute horizontal offset for winding snake path:
  // Alternates: Center -> Left -> Center -> Right -> Center
  const getNodeOffset = (idx: number): number => {
    const cycle = idx % 4;
    switch (cycle) {
      case 0:
        return 0; // center
      case 1:
        return -55; // left
      case 2:
        return 0; // center
      case 3:
        return 55; // right
      default:
        return 0;
    }
  };

  const handleNodePress = (level: StudyLevel, isLocked: boolean) => {
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onSelectLevel(level);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Starting Summit Banner */}
      <View style={styles.startBanner}>
        <View style={styles.pathHeaderPill}>
          <Sparkles size={14} color="#06B6D4" />
          <Text style={styles.pathHeaderPillText}>ADAPTIVE LEARNING ROAD</Text>
        </View>
        <View style={styles.titleWithInfoRow}>
          <Text style={styles.pathMainTitle}>From Age 13 to CAT 99%ile</Text>
          {onInfoPress && <InfoButton size={13} color="#06B6D4" onPress={onInfoPress} />}
        </View>
      </View>

      {/* The Journey Nodes */}
      <View style={styles.pathTrackContainer}>
        {levels.map((level, idx) => {
          const isCompleted = completedSet.has(level.id);
          const isCurrent = level.id === currentLevel;
          const isUnlocked = isCompleted || isCurrent || level.id <= currentLevel;
          const isLocked = !isUnlocked;
          const stars = levelStars[level.id] || 0;
          const offsetX = getNodeOffset(idx);
          const stageInfo = STAGE_DECORATIONS[level.id];

          return (
            <React.Fragment key={level.id}>
              {/* Stage Milestone Divider Banner */}
              {stageInfo && (
                <View style={styles.stageDivider}>
                  <LinearGradient
                    colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']}
                    style={styles.stageDividerCard}
                  >
                    <View style={styles.stageDividerLeft}>
                      <Text style={styles.stageEmoji}>{stageInfo.icon}</Text>
                      <View>
                        <Text style={styles.stageDividerTag}>{level.stageName.toUpperCase()}</Text>
                        <Text style={styles.stageDividerTitle}>{stageInfo.title}</Text>
                        <Text style={styles.stageDividerSub}>{stageInfo.subtitle}</Text>
                      </View>
                    </View>
                    <View style={[styles.stageBadge, { backgroundColor: level.badgeColor }]}>
                      <Text style={styles.stageBadgeText}>
                        {level.gradeTag.split('•')[0].trim()}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Connecting Vertical Track Line */}
              {idx > 0 && !stageInfo && (
                <View style={styles.connectorContainer}>
                  <View
                    style={[styles.connectorLine, isUnlocked && styles.connectorLineUnlocked]}
                  />
                </View>
              )}

              {/* Stepping Stone Node Item */}
              <View style={[styles.nodeRow, { transform: [{ translateX: offsetX }] }]}>
                {/* Active Level "YOU ARE HERE" indicator */}
                {isCurrent && (
                  <View style={styles.avatarPinContainer}>
                    <LinearGradient colors={['#06B6D4', '#3B82F6']} style={styles.avatarPin}>
                      <Text style={styles.avatarPinEmoji}>{userAvatar}</Text>
                      <Text style={styles.avatarPinText}>YOU</Text>
                    </LinearGradient>
                    <View style={styles.avatarPinArrow} />
                  </View>
                )}

                {/* The Disc Stone */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.nodeDisc,
                    isCompleted && styles.nodeDiscCompleted,
                    isCurrent && styles.nodeDiscCurrent,
                    isLocked && styles.nodeDiscLocked,
                  ]}
                  onPress={() => handleNodePress(level, isLocked)}
                >
                  <LinearGradient
                    colors={
                      isCurrent
                        ? ['#06B6D4', '#3B82F6']
                        : isCompleted
                          ? ['#10B981', '#059669']
                          : isLocked
                            ? ['#1E293B', '#0F172A']
                            : ['#334155', '#1E293B']
                    }
                    style={styles.nodeDiscGradient}
                  >
                    {isCompleted ? (
                      <Check size={28} color="#FFFFFF" strokeWidth={3} />
                    ) : isLocked ? (
                      <Lock size={20} color="#64748B" />
                    ) : (
                      <Text style={styles.nodeNumberText}>{level.id}</Text>
                    )}
                  </LinearGradient>

                  {/* Level Star Rating below stone if completed */}
                  {isCompleted && (
                    <View style={styles.nodeStarsRow}>
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={10}
                          color={s <= stars ? '#F59E0B' : '#475569'}
                          fill={s <= stars ? '#F59E0B' : 'transparent'}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>

                {/* Level Title Tag alongside node */}
                <View style={styles.nodeLabelBox}>
                  <Text
                    style={[
                      styles.nodeTitle,
                      isCurrent && styles.nodeTitleCurrent,
                      isLocked && styles.nodeTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {level.title}
                  </Text>
                  <Text
                    style={[styles.nodeSub, isLocked && styles.nodeSubLocked]}
                    numberOfLines={1}
                  >
                    {level.gradeTag}
                  </Text>
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Summit Trophy Finish Milestone */}
      <View style={styles.summitCard}>
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.15)', 'rgba(234, 88, 12, 0.05)']}
          style={styles.summitInner}
        >
          <Trophy size={48} color="#F59E0B" />
          <Text style={styles.summitTitle}>CAT 99th Percentile Pinnacle</Text>
          <Text style={styles.summitSub}>
            Complete all 30 levels to unlock the Grandmaster Aptitude Badge!
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  startBanner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  pathHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginBottom: 8,
  },
  pathHeaderPillText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pathMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  titleWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pathTrackContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  stageDivider: {
    width: width - 36,
    marginVertical: 20,
  },
  stageDividerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stageDividerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stageEmoji: {
    fontSize: 28,
  },
  stageDividerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 0.6,
  },
  stageDividerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  stageDividerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stageBadgeText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  connectorContainer: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorLine: {
    width: 4,
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 2,
  },
  connectorLineUnlocked: {
    backgroundColor: 'rgba(6, 182, 212, 0.4)',
  },
  nodeRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  avatarPinContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPinEmoji: {
    fontSize: 14,
  },
  avatarPinText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  avatarPinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#3B82F6',
  },
  nodeDisc: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  nodeDiscCompleted: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
  },
  nodeDiscCurrent: {
    borderColor: '#06B6D4',
    transform: [{ scale: 1.08 }],
    shadowColor: '#06B6D4',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  nodeDiscLocked: {
    borderColor: '#1E293B',
    opacity: 0.6,
  },
  nodeDiscGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumberText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
  },
  nodeStarsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 2,
  },
  nodeLabelBox: {
    alignItems: 'center',
    marginTop: 8,
    maxWidth: 160,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  nodeTitleCurrent: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  nodeTitleLocked: {
    color: '#64748B',
  },
  nodeSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  nodeSubLocked: {
    color: '#475569',
  },
  summitCard: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  summitInner: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  summitTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  summitSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
