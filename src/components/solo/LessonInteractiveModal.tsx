import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  BookOpen,
  Zap,
  Star,
  Compass,
  Trophy,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { StudyLevel } from '../../types/soloStudy';
import { useSoloStudyStore } from '../../store/useSoloStudyStore';
import { useRewardsStore } from '../../store/useRewardsStore';
import { KojiTutorCard } from '../koji/KojiTutorCard';
import { KojiInteractiveModal } from '../koji/KojiInteractiveModal';
import { generateKojiCorrection } from '../../services/kojiTutorService';
import { Question, QuestionCategory } from '../../types/game';

const inferCategory = (title: string, text: string): QuestionCategory => {
  const combined = (title + ' ' + text).toLowerCase();
  if (combined.includes('speed') || combined.includes('distance') || combined.includes('train'))
    return 'speed_distance';
  if (
    combined.includes('percent') ||
    combined.includes('profit') ||
    combined.includes('discount') ||
    combined.includes('loss')
  )
    return 'percentages';
  if (
    combined.includes('work') ||
    combined.includes('pipe') ||
    combined.includes('cistern') ||
    combined.includes('days')
  )
    return 'time_work';
  if (
    combined.includes('probab') ||
    combined.includes('dice') ||
    combined.includes('card') ||
    combined.includes('permutation')
  )
    return 'probability';
  if (
    combined.includes('ratio') ||
    combined.includes('fraction') ||
    combined.includes('proportion')
  )
    return 'fractions';
  if (combined.includes('series') || combined.includes('sequence') || combined.includes('pattern'))
    return 'series';
  return 'arithmetic';
};

interface Props {
  level: StudyLevel | null;
  visible: boolean;
  onClose: () => void;
  onLevelCompleted?: (levelId: number) => void;
}

const { width } = Dimensions.get('window');

type LessonPhase = 'hook' | 'questions' | 'completed';

export const LessonInteractiveModal: React.FC<Props> = ({
  level,
  visible,
  onClose,
  onLevelCompleted,
}) => {
  const { completeLevel } = useSoloStudyStore();
  const { recordMatchOutcome } = useRewardsStore();

  const [phase, setPhase] = useState<LessonPhase>('hook');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [showKojiDoubtModal, setShowKojiDoubtModal] = useState(false);

  useEffect(() => {
    if (visible) {
      setPhase('hook');
      setCurrentQIndex(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setCorrectCount(0);
      setPointsAwarded(null);
      setShowKojiDoubtModal(false);
    }
  }, [visible, level?.id]);

  if (!level) return null;

  const currentQ = level.questions[currentQIndex];

  const handleStartQuestions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('questions');
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const handleNextQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (currentQIndex + 1 < level.questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished all questions!
      const totalQ = level.questions.length;
      const finalCorrect = selectedAnswer === currentQ.correctIndex ? correctCount : correctCount;
      const stars = finalCorrect === totalQ ? 3 : finalCorrect >= 2 ? 2 : 1;
      completeLevel(level.id, stars, level.xpReward);

      // Record Matiks Points for Solo Study (>= 2 stars is a Win, < 2 stars is a Loss)
      const outcome = stars >= 2 ? 'win' : 'loss';
      const res = recordMatchOutcome('study', outcome, { correctCount: finalCorrect });
      setPointsAwarded(res.delta);

      setPhase('completed');
      if (onLevelCompleted) {
        onLevelCompleted(level.id);
      }
    }
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

          <View style={styles.headerInfo}>
            <Text style={styles.headerGrade}>{level.gradeTag}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Level {level.id}: {level.title}
            </Text>
          </View>

          <View style={styles.xpBadge}>
            <Zap size={14} color="#F59E0B" />
            <Text style={styles.xpBadgeText}>+{level.xpReward} XP</Text>
          </View>
        </View>

        {/* Phase 1: Brilliant-style Intuition & Mental Model */}
        {phase === 'hook' && (
          <ScrollView
            contentContainerStyle={styles.hookContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stageTagBanner}>
              <Text style={[styles.stageTagText, { color: level.accentColor }]}>
                {level.stageName.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.hookHeadline}>{level.conceptHook.headline}</Text>
            <Text style={styles.hookSubtitle}>{level.subtitle}</Text>

            {/* Real World Analogy (For 13-year-olds & Beginners) */}
            <View style={styles.analogyCard}>
              <View style={styles.cardHeaderRow}>
                <Lightbulb size={20} color="#FBBF24" />
                <Text style={styles.cardHeaderTitle}>Intuition & Mental Model</Text>
              </View>
              <Text style={styles.cardBodyText}>{level.conceptHook.intuition}</Text>
            </View>

            {/* Real World Example */}
            <View style={[styles.analogyCard, { borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
              <View style={styles.cardHeaderRow}>
                <Compass size={20} color="#06B6D4" />
                <Text style={[styles.cardHeaderTitle, { color: '#06B6D4' }]}>
                  Real-World Picture
                </Text>
              </View>
              <Text style={styles.cardBodyText}>{level.conceptHook.realWorldExample}</Text>
            </View>

            {/* Mental Shortcut or Key Formula */}
            {(level.conceptHook.mentalShortcut || level.conceptHook.keyFormula) && (
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.18)', 'rgba(59, 130, 246, 0.12)']}
                style={styles.shortcutCard}
              >
                <View style={styles.cardHeaderRow}>
                  <Zap size={20} color="#A78BFA" />
                  <Text style={[styles.cardHeaderTitle, { color: '#C4B5FD' }]}>
                    Competitive Shortcut & Rule
                  </Text>
                </View>
                {level.conceptHook.keyFormula && (
                  <View style={styles.formulaPill}>
                    <Text style={styles.formulaText}>{level.conceptHook.keyFormula}</Text>
                  </View>
                )}
                {level.conceptHook.mentalShortcut && (
                  <Text style={styles.shortcutText}>{level.conceptHook.mentalShortcut}</Text>
                )}
              </LinearGradient>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: level.accentColor }]}
              onPress={handleStartQuestions}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Start Practice Challenges</Text>
              <ArrowRight size={20} color="#0F172A" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Phase 2: Interactive Practice Questions */}
        {phase === 'questions' && currentQ && (
          <View style={styles.questionsContainer}>
            {/* Question Progress Bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${((currentQIndex + 1) / level.questions.length) * 100}%`,
                      backgroundColor: level.accentColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentQIndex + 1} of {level.questions.length}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.questionScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Exam Attribution Tag */}
              {currentQ.examTag && (
                <View style={styles.examTagRow}>
                  <BookOpen size={14} color="#06B6D4" />
                  <Text style={styles.examTagBadge}>{currentQ.examTag}</Text>
                  {currentQ.difficultyNote && (
                    <Text style={styles.diffBadge}>{currentQ.difficultyNote}</Text>
                  )}
                </View>
              )}

              {/* Question Text */}
              <Text style={styles.questionText}>{currentQ.text}</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.optionItem,
                        !isAnswerSubmitted && isSelected && styles.optionSelected,
                        isAnswerSubmitted && isCorrect && styles.optionCorrect,
                        isAnswerSubmitted && isSelected && !isCorrect && styles.optionWrong,
                      ]}
                      onPress={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLetter}>
                        <Text style={styles.optionLetterText}>{String.fromCharCode(65 + idx)}</Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isAnswerSubmitted && isCorrect && styles.optionTextCorrect,
                          isAnswerSubmitted && isSelected && !isCorrect && styles.optionTextWrong,
                        ]}
                      >
                        {opt}
                      </Text>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 size={20} color="#10B981" style={{ marginLeft: 8 }} />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle size={20} color="#EF4444" style={{ marginLeft: 8 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Explanation & Feedback */}
              {isAnswerSubmitted &&
                (selectedAnswer === currentQ.correctIndex ? (
                  <View style={styles.explanationCard}>
                    <View style={styles.feedbackHeader}>
                      <View style={styles.feedbackRow}>
                        <CheckCircle2 size={18} color="#10B981" />
                        <Text style={styles.feedbackCorrectText}>Spot on! Excellent logic.</Text>
                      </View>
                    </View>
                    <Text style={styles.explanationBody}>{currentQ.explanation}</Text>

                    <TouchableOpacity
                      style={[styles.nextBtn, { backgroundColor: level.accentColor }]}
                      onPress={handleNextQuestion}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.nextBtnText}>
                        {currentQIndex + 1 < level.questions.length
                          ? 'Next Question'
                          : 'Complete Level'}
                      </Text>
                      <ArrowRight size={18} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <KojiTutorCard
                    correction={generateKojiCorrection(
                      {
                        ...currentQ,
                        category: inferCategory(level.title, currentQ.text),
                        difficulty: 'medium',
                        timeLimit: 30,
                      },
                      selectedAnswer ?? 0
                    )}
                    onAskDoubt={() => setShowKojiDoubtModal(true)}
                    onContinue={handleNextQuestion}
                    continueButtonText={
                      currentQIndex + 1 < level.questions.length
                        ? 'Next Question ➔'
                        : 'Complete Level ➔'
                    }
                  />
                ))}
            </ScrollView>
          </View>
        )}

        {/* Phase 3: Level Complete Celebration */}
        {phase === 'completed' && (
          <View style={styles.completedContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.05)']}
              style={styles.celebrationCard}
            >
              <Award size={64} color="#10B981" style={styles.trophyIcon} />
              <Text style={styles.completedTitle}>Level {level.id} Conquered!</Text>
              <Text style={styles.completedSubtitle}>{level.title}</Text>

              {/* Stars Rating */}
              <View style={styles.starsRow}>
                {[1, 2, 3].map((star) => {
                  const isEarned =
                    (correctCount === 3 && star <= 3) ||
                    (correctCount === 2 && star <= 2) ||
                    (correctCount <= 1 && star === 1);
                  return (
                    <Star
                      key={star}
                      size={32}
                      color={isEarned ? '#F59E0B' : '#334155'}
                      fill={isEarned ? '#F59E0B' : 'transparent'}
                      style={{ marginHorizontal: 6 }}
                    />
                  );
                })}
              </View>

              <View style={styles.rewardBadges}>
                <View style={styles.rewardPill}>
                  <Zap size={18} color="#F59E0B" />
                  <Text style={styles.rewardPillText}>+{level.xpReward} XP</Text>
                </View>
                {pointsAwarded !== null && (
                  <View
                    style={[
                      styles.rewardPill,
                      pointsAwarded >= 0 ? styles.pointsPillPositive : styles.pointsPillNegative,
                    ]}
                  >
                    <Trophy size={16} color={pointsAwarded >= 0 ? '#10B981' : '#EF4444'} />
                    <Text
                      style={[
                        styles.rewardPillText,
                        { color: pointsAwarded >= 0 ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {pointsAwarded > 0 ? `+${pointsAwarded}` : pointsAwarded} Pts
                    </Text>
                  </View>
                )}
                <View style={styles.rewardPill}>
                  <Sparkles size={18} color="#06B6D4" />
                  <Text style={styles.rewardPillText}>
                    {correctCount}/{level.questions.length} Correct
                  </Text>
                </View>
              </View>

              <Text style={styles.congratsQuote}>
                "You've stepped closer from foundational reasoning to peak aptitude mastery!"
              </Text>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: '#10B981', width: '100%', marginTop: 24 },
                ]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Continue Journey ➔</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Koji Interactive Doubt & Concept Clinic */}
        <KojiInteractiveModal
          visible={showKojiDoubtModal}
          question={
            currentQ
              ? {
                  ...currentQ,
                  category: inferCategory(level.title, currentQ.text),
                  difficulty: 'medium',
                  timeLimit: 30,
                }
              : null
          }
          chosenIndex={selectedAnswer ?? 0}
          onClose={() => setShowKojiDoubtModal(false)}
        />
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerGrade: {
    fontSize: 11,
    color: '#06B6D4',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 4,
  },
  xpBadgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  hookContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stageTagBanner: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  stageTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  hookHeadline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 32,
    marginBottom: 8,
  },
  hookSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 20,
  },
  analogyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FBBF24',
  },
  cardBodyText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  shortcutCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    marginBottom: 24,
  },
  formulaPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  formulaText: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 14,
  },
  shortcutText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 21,
    fontWeight: '500',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  questionsContainer: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  questionScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  examTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  examTagBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  diffBadge: {
    backgroundColor: '#1E293B',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  optionSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 21,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: '#6EE7B7',
    fontWeight: '700',
  },
  optionTextWrong: {
    color: '#FCA5A5',
  },
  explanationCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 8,
  },
  feedbackHeader: {
    marginBottom: 10,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackCorrectText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
  feedbackWrongText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  explanationBody: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
    marginBottom: 16,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  celebrationCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  trophyIcon: {
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rewardPillText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  pointsPillPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  pointsPillNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  congratsQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
