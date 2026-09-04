import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Trophy,
  Gift,
  CheckCircle2,
  Calendar,
  Swords,
  Zap,
  BookOpen,
  Target,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Shield,
  Award,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRewardsStore, POINTS_RULES } from '../../store/useRewardsStore';
import { useUserStore } from '../../store/useUserStore';
import { DailyTask } from '../../types/rewards';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const getTaskIcon = (icon: string) => {
  switch (icon) {
    case 'calendar':
      return <Calendar size={18} color="#38BDF8" />;
    case 'swords':
      return <Swords size={18} color="#F472B6" />;
    case 'zap':
      return <Zap size={18} color="#FBBF24" />;
    case 'book':
      return <BookOpen size={18} color="#34D399" />;
    case 'target':
    default:
      return <Target size={18} color="#A78BFA" />;
  }
};

export const DailyRewardsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { profile } = useUserStore();
  const {
    tasks,
    bonusChestClaimed,
    history,
    claimTask,
    claimBonusChest,
    isBonusChestEligible,
  } = useRewardsStore();

  const completedCount = tasks.filter((t) => t.current >= t.target).length;
  const canClaimBonus = isBonusChestEligible();

  const handleClaimTask = (task: DailyTask) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    claimTask(task.id);
  };

  const handleClaimBonusChest = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    claimBonusChest();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>MATIKS REWARDS</Text>
            <Text style={styles.headerTitle}>Daily Tasks & Points</Text>
          </View>

          {/* User Points Badge */}
          <View style={styles.pointsPill}>
            <Trophy size={14} color="#F59E0B" />
            <Text style={styles.pointsPillText}>{profile.rating || 1200} PTS</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Grand Daily Bonus Crown Chest Card */}
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.18)', 'rgba(234, 88, 12, 0.08)']}
            style={styles.bonusChestCard}
          >
            <View style={styles.bonusChestTop}>
              <View style={styles.bonusChestIconBox}>
                <Gift size={28} color="#F59E0B" />
              </View>
              <View style={styles.bonusChestInfo}>
                <Text style={styles.bonusChestTag}>DAILY GRAND CHEST</Text>
                <Text style={styles.bonusChestTitle}>Complete All 5 Daily Tasks</Text>
                <Text style={styles.bonusChestSub}>
                  {completedCount}/5 finished • Resets every midnight
                </Text>
              </View>
              <View style={styles.bonusPointsBadge}>
                <Text style={styles.bonusPointsText}>+{POINTS_RULES.bonusChest} PTS</Text>
              </View>
            </View>

            {/* Step Progress Dots */}
            <View style={styles.stepsRow}>
              {tasks.map((task, idx) => {
                const done = task.current >= task.target;
                return (
                  <View key={task.id} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                      ]}
                    >
                      {done ? (
                        <CheckCircle2 size={12} color="#10B981" />
                      ) : (
                        <Text style={styles.stepDotNum}>{idx + 1}</Text>
                      )}
                    </View>
                    {idx < tasks.length - 1 && (
                      <View
                        style={[
                          styles.stepConnector,
                          done && styles.stepConnectorDone,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Claim Bonus Button */}
            {bonusChestClaimed ? (
              <View style={styles.claimedBanner}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.claimedBannerText}>Daily Grand Chest Claimed Today!</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.claimBonusBtn,
                  !canClaimBonus && styles.claimBonusBtnDisabled,
                ]}
                disabled={!canClaimBonus}
                onPress={handleClaimBonusChest}
                activeOpacity={0.85}
              >
                <Sparkles size={16} color={canClaimBonus ? '#0F172A' : '#64748B'} />
                <Text
                  style={[
                    styles.claimBonusBtnText,
                    !canClaimBonus && styles.claimBonusBtnTextDisabled,
                  ]}
                >
                  {canClaimBonus
                    ? `Claim Grand Chest (+${POINTS_RULES.bonusChest} PTS)`
                    : `Complete ${5 - completedCount} more tasks to unlock`}
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Section: Today's Quests */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TODAY'S DAILY TASKS</Text>
            <Text style={styles.sectionSub}>Earn points every day</Text>
          </View>

          {/* Task Cards */}
          <View style={styles.tasksList}>
            {tasks.map((task) => {
              const isFinished = task.current >= task.target;
              const isClaimed = task.claimed;
              const progressPct = Math.min(100, Math.round((task.current / task.target) * 100));

              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <View style={styles.taskIconCircle}>{getTaskIcon(task.icon)}</View>

                    <View style={styles.taskTitleGroup}>
                      <View style={styles.taskTagRow}>
                        <Text style={styles.taskFormatTag}>{task.formatTag}</Text>
                        <Text style={styles.taskPointsTag}>+{task.points} PTS</Text>
                      </View>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                    </View>
                  </View>

                  <Text style={styles.taskDesc}>{task.description}</Text>

                  {/* Progress bar */}
                  <View style={styles.taskProgressRow}>
                    <View style={styles.taskProgressBarBg}>
                      <View
                        style={[
                          styles.taskProgressBarFill,
                          { width: `${progressPct}%` },
                          isFinished && { backgroundColor: '#10B981' },
                        ]}
                      />
                    </View>
                    <Text style={styles.taskProgressRatio}>
                      {task.current}/{task.target}
                    </Text>
                  </View>

                  {/* Claim Button */}
                  <View style={styles.taskFooterRow}>
                    {isClaimed ? (
                      <View style={styles.taskStatusClaimed}>
                        <CheckCircle2 size={15} color="#10B981" />
                        <Text style={styles.taskStatusClaimedText}>Claimed (+{task.points} PTS)</Text>
                      </View>
                    ) : isFinished ? (
                      <TouchableOpacity
                        style={styles.taskClaimBtn}
                        onPress={() => handleClaimTask(task)}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          style={styles.taskClaimGradient}
                        >
                          <Gift size={14} color="#FFFFFF" />
                          <Text style={styles.taskClaimBtnText}>CLAIM +{task.points} PTS</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.taskStatusPending}>
                        <Text style={styles.taskStatusPendingText}>
                          In Progress ({progressPct}%)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Points Rules Across All Formats */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>POINTS SYSTEM (ALL FORMATS)</Text>
            <Text style={styles.sectionSub}>Wins gain points • Losses lose points</Text>
          </View>

          <View style={styles.rulesCard}>
            <View style={styles.rulesGrid}>
              <View style={styles.ruleCol}>
                <Text style={styles.ruleFormatName}>🌐 Online 1v1</Text>
                <View style={styles.ruleBadgeRow}>
                  <Text style={styles.ruleWinText}>Win: +{POINTS_RULES.online.win} pts</Text>
                  <Text style={styles.ruleLossText}>Loss: {POINTS_RULES.online.loss} pts</Text>
                </View>
              </View>

              <View style={styles.ruleCol}>
                <Text style={styles.ruleFormatName}>📱 Split-Screen</Text>
                <View style={styles.ruleBadgeRow}>
                  <Text style={styles.ruleWinText}>Win: +{POINTS_RULES.duel.win} pts</Text>
                  <Text style={styles.ruleLossText}>Loss: {POINTS_RULES.duel.loss} pts</Text>
                </View>
              </View>

              <View style={styles.ruleCol}>
                <Text style={styles.ruleFormatName}>⚡ Solo Blitz</Text>
                <View style={styles.ruleBadgeRow}>
                  <Text style={styles.ruleWinText}>≥60%: +{POINTS_RULES.blitz.win} pts</Text>
                  <Text style={styles.ruleLossText}>&lt;60%: {POINTS_RULES.blitz.loss} pts</Text>
                </View>
              </View>

              <View style={styles.ruleCol}>
                <Text style={styles.ruleFormatName}>📚 Solo Study</Text>
                <View style={styles.ruleBadgeRow}>
                  <Text style={styles.ruleWinText}>≥2 Stars: +{POINTS_RULES.study.win} pts</Text>
                  <Text style={styles.ruleLossText}>&lt;2 Stars: {POINTS_RULES.study.loss} pts</Text>
                </View>
              </View>
            </View>

            <View style={styles.ruleFloorNote}>
              <Shield size={14} color="#38BDF8" />
              <Text style={styles.ruleFloorNoteText}>
                Protection Floor: Points will never drop below 0.
              </Text>
            </View>
          </View>

          {/* Recent Points History */}
          {history.length > 0 && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>RECENT POINTS ACTIVITY</Text>
                <Text style={styles.sectionSub}>Latest match outcomes & claims</Text>
              </View>

              <View style={styles.historyList}>
                {history.slice(0, 8).map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      {item.delta >= 0 ? (
                        <TrendingUp size={16} color="#10B981" />
                      ) : (
                        <TrendingDown size={16} color="#EF4444" />
                      )}
                      <Text style={styles.historyDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.historyDelta,
                        item.delta >= 0 ? styles.historyDeltaPositive : styles.historyDeltaNegative,
                      ]}
                    >
                      {item.delta > 0 ? `+${item.delta}` : item.delta} PTS
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  pointsPillText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  bonusChestCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 22,
  },
  bonusChestTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusChestIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bonusChestInfo: {
    flex: 1,
  },
  bonusChestTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  bonusChestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  bonusChestSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  bonusPointsBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bonusPointsText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
    paddingHorizontal: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  stepDotNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#1E293B',
    marginHorizontal: 4,
  },
  stepConnectorDone: {
    backgroundColor: '#10B981',
  },
  claimBonusBtn: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  claimBonusBtnDisabled: {
    backgroundColor: '#1E293B',
  },
  claimBonusBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  claimBonusBtnTextDisabled: {
    color: '#64748B',
  },
  claimedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  claimedBannerText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  tasksList: {
    gap: 12,
    marginBottom: 22,
  },
  taskCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskTitleGroup: {
    flex: 1,
  },
  taskTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  taskFormatTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
  },
  taskPointsTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  taskDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 10,
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  taskProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  taskProgressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  taskProgressRatio: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  taskFooterRow: {
    alignItems: 'flex-end',
  },
  taskClaimBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  taskClaimGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  taskClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  taskStatusClaimed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskStatusClaimedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  taskStatusPending: {
    paddingVertical: 4,
  },
  taskStatusPendingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  rulesCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 22,
  },
  rulesGrid: {
    gap: 12,
    marginBottom: 12,
  },
  ruleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  ruleFormatName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  ruleBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ruleWinText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ruleLossText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ruleFloorNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  ruleFloorNoteText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  historyList: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  historyDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
    flex: 1,
  },
  historyDelta: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyDeltaPositive: {
    color: '#10B981',
  },
  historyDeltaNegative: {
    color: '#EF4444',
  },
});
