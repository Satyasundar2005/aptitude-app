import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  X,
  Lightbulb,
  Award,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/useGameStore';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const TRACK_LABELS: Record<string, string> = {
  gate: 'GATE (10-Yr PYQ)',
  cat: 'CAT (IIMs QA & DILR)',
  ese: 'ESE (Paper-1 GS & Aptitude)',
  placement: 'Campus Placements',
  banking: 'Banking & Speed Math',
  all: 'All-Round Aptitude',
};

export default function PracticeScreen() {
  const router = useRouter();
  const {
    currentQuestion,
    examTrack,
    difficulty,
    roundNumber,
    player1,
    submitAnswer,
    nextQuestion,
    resetGame,
  } = useGameStore();

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [stats, setStats] = useState({ totalAttempted: 0, totalCorrect: 0 });

  useEffect(() => {
    setSelectedAnswerIndex(null);
  }, [currentQuestion?.id]);

  const handleSelectOption = (index: number) => {
    if (selectedAnswerIndex !== null || !currentQuestion) return;

    setSelectedAnswerIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStats((prev) => ({
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: prev.totalCorrect + 1,
      }));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStats((prev) => ({
        ...prev,
        totalAttempted: prev.totalAttempted + 1,
      }));
    }

    submitAnswer(1, index);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextQuestion();
  };

  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetGame();
    router.replace('/');
  };

  const hasAnswered = selectedAnswerIndex !== null;
  const isCorrect = selectedAnswerIndex !== null && currentQuestion && selectedAnswerIndex === currentQuestion.correctIndex;
  const accuracy = stats.totalAttempted > 0 ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100) : 100;

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.trackPill}>
          <Text style={styles.trackPillText}>{TRACK_LABELS[examTrack] || 'Aptitude Practice'}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Award size={14} color="#f59e0b" style={{ marginRight: 4 }} />
          <Text style={styles.scoreText}>{player1.score}</Text>
        </View>
      </View>

      {/* Sub-header with Round Progress & Accuracy */}
      <View style={styles.metaRow}>
        <Text style={styles.metaRound}>Question #{roundNumber}</Text>
        <View style={styles.accuracyPill}>
          <CheckCircle2 size={12} color="#10b981" style={{ marginRight: 4 }} />
          <Text style={styles.accuracyText}>Accuracy: {accuracy}% ({stats.totalCorrect}/{stats.totalAttempted})</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.tagRow}>
            {currentQuestion?.examTag && (
              <View style={styles.examTagBadge}>
                <BookOpen size={11} color="#60a5fa" style={{ marginRight: 4 }} />
                <Text style={styles.examTagText}>{currentQuestion.examTag}</Text>
              </View>
            )}

            <View style={styles.difficultyTag}>
              <Text style={styles.difficultyTagText}>{difficulty.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQuestion?.text ?? 'Loading question...'}</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {(currentQuestion?.options ?? []).map((option, index) => {
            const isSelected = selectedAnswerIndex === index;
            const isTrueCorrect = index === currentQuestion?.correctIndex;

            let cardStyle: any[] = [styles.optionCard];
            let labelBadgeStyle: any[] = [styles.optionLabelBadge];
            let labelTextStyle: any[] = [styles.optionLabelText];
            let textStyle: any[] = [styles.optionText];
            let IconComponent = null;

            if (hasAnswered) {
              if (isSelected) {
                if (isCorrect) {
                  cardStyle.push(styles.optionCorrect);
                  textStyle.push(styles.optionTextLight);
                  labelBadgeStyle.push(styles.labelBadgeCorrect);
                  IconComponent = <Check size={18} color="#ffffff" />;
                } else {
                  cardStyle.push(styles.optionWrong);
                  textStyle.push(styles.optionTextLight);
                  labelBadgeStyle.push(styles.labelBadgeWrong);
                  IconComponent = <X size={18} color="#ffffff" />;
                }
              } else if (isTrueCorrect) {
                cardStyle.push(styles.optionRevealCorrect);
                textStyle.push(styles.optionTextReveal);
                labelBadgeStyle.push(styles.labelBadgeReveal);
                IconComponent = <Check size={16} color="#10b981" />;
              } else {
                cardStyle.push(styles.optionDimmed);
              }
            }

            return (
              <TouchableOpacity
                key={`${currentQuestion?.id ?? 'q'}_${index}`}
                style={cardStyle}
                onPress={() => handleSelectOption(index)}
                activeOpacity={0.75}
                disabled={hasAnswered}
              >
                <View style={labelBadgeStyle}>
                  <Text style={labelTextStyle}>{OPTION_LABELS[index]}</Text>
                </View>

                <Text style={textStyle}>{option}</Text>

                {IconComponent && <View style={styles.iconContainer}>{IconComponent}</View>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step-by-Step Solution & Concept Explanation Box */}
        {hasAnswered && currentQuestion?.explanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeaderRow}>
              <Lightbulb size={16} color="#f59e0b" style={{ marginRight: 6 }} />
              <Text style={styles.explanationTitle}>Concept & Step-by-Step Solution</Text>
            </View>
            {currentQuestion?.examTag && (
              <View style={styles.solutionSourceBadge}>
                <BookOpen size={11} color="#93c5fd" style={{ marginRight: 5 }} />
                <Text style={styles.solutionSourceText}>Official Paper: {currentQuestion.examTag}</Text>
              </View>
            )}
            <Text style={styles.explanationBody}>{currentQuestion.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar with Next / Skip */}
      <View style={styles.bottomBar}>
        {hasAnswered ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Next Question</Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.skipButton} onPress={handleNext} activeOpacity={0.7}>
            <Text style={styles.skipButtonText}>Skip Question</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  trackPillText: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  scoreText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  metaRound: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  accuracyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accuracyText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  examTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  examTagText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '800',
  },
  difficultyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyTagText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
  },
  questionText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  optionsList: {
    gap: 12,
    marginBottom: 18,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionCorrect: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  optionWrong: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  optionRevealCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1.5,
  },
  optionDimmed: {
    opacity: 0.45,
  },
  optionLabelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  labelBadgeCorrect: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  labelBadgeWrong: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  labelBadgeReveal: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  optionLabelText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  optionText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionTextLight: {
    color: '#ffffff',
    fontWeight: '800',
  },
  optionTextReveal: {
    color: '#a7f3d0',
    fontWeight: '800',
  },
  iconContainer: {
    marginLeft: 8,
  },
  explanationCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 20,
  },
  explanationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  solutionSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  solutionSourceText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  explanationBody: {
    color: '#fde68a',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  skipButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },
});
