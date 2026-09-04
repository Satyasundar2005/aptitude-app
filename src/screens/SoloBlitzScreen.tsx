import React, { useEffect, useRef, useState } from 'react';
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
  Timer,
  Trophy,
  Zap,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  X,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Gauge,
  Lightbulb,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/useGameStore';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const TRACK_LABELS: Record<string, string> = {
  gate: 'GATE (10-Yr PYQ)',
  cat: 'CAT (IIMs)',
  gre: 'GRE General',
  ese: 'ESE (IES Paper-1)',
  placement: 'Campus Placements',
  banking: 'Banking & Speed Math',
  all: 'All-Round Aptitude',
};

const PACE_INFO: Record<string, { label: string; time: string; color: string }> = {
  easy: { label: 'Foundation Pace', time: '60s / Q', color: '#10b981' },
  medium: { label: 'GATE / GRE Pace', time: '45s / Q', color: '#f59e0b' },
  hard: { label: 'CAT Sprint Pace', time: '30s / Q', color: '#ef4444' },
};

export default function SoloBlitzScreen() {
  const router = useRouter();
  const {
    phase,
    timer,
    maxTime,
    difficulty,
    examTrack,
    currentQuestion,
    player1,
    roundNumber,
    totalRounds,
    blitzHistory,
    submitAnswer,
    tickTimer,
    setPhase,
    startSoloBlitz,
    resetGame,
  } = useGameStore();

  const [countdown, setCountdown] = useState(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerPulse = useRef(new Animated.Value(1)).current;
  const scorePop = useRef(new Animated.Value(1)).current;

  // Reset selected answer on question change
  useEffect(() => {
    setSelectedOption(null);
  }, [currentQuestion?.id]);

  // Countdown timer: 3 -> 2 -> 1 -> GO!
  useEffect(() => {
    if (phase === 'countdown') {
      setCountdown(3);
      let count = 3;
      const countInterval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countInterval);
          setCountdown(0);
          setPhase('playing');
        } else {
          setCountdown(count);
        }
      }, 750);
      return () => clearInterval(countInterval);
    }
  }, [phase]);

  // Main game ticker
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Pulse timer when under 10 seconds
  useEffect(() => {
    if (timer <= 10 && phase === 'playing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerPulse, { toValue: 1.15, duration: 250, useNativeDriver: true }),
          Animated.timing(timerPulse, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else {
      timerPulse.setValue(1);
    }
  }, [timer, phase]);

  const handleSelectAnswer = (index: number) => {
    if (selectedOption !== null || player1.answeredCorrect !== null || phase !== 'playing') return;
    setSelectedOption(index);

    const isCorrect = currentQuestion && index === currentQuestion.correctIndex;
    if (isCorrect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.timing(scorePop, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.spring(scorePop, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    submitAnswer(1, index);
  };

  const handleRetakeTest = () => {
    startSoloBlitz(difficulty, examTrack);
  };

  const handleExit = () => {
    resetGame();
    router.replace('/');
  };

  const timerColor = timer > 20 ? '#10b981' : timer > 10 ? '#f59e0b' : '#ef4444';
  const pace = PACE_INFO[difficulty] || PACE_INFO.medium;
  const trackTitle = TRACK_LABELS[examTrack] || 'Exam Aptitude';

  const hasAnswered = player1.answeredCorrect !== null;
  const isCorrect = player1.answeredCorrect === true;

  // Performance calculations
  const totalCorrect = blitzHistory.filter((h) => h.isCorrect).length;
  const accuracyPct =
    blitzHistory.length > 0 ? Math.round((totalCorrect / blitzHistory.length) * 100) : 0;
  const avgTimePerQ =
    blitzHistory.length > 0
      ? Math.round(
          (blitzHistory.reduce((acc, h) => acc + h.timeTaken, 0) / blitzHistory.length) * 10
        ) / 10
      : 0;

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <StatusBar style="light" />

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownTrackPill}>
            <Sparkles size={14} color="#818cf8" style={{ marginRight: 6 }} />
            <Text style={styles.countdownTrackText}>
              {trackTitle.toUpperCase()} • 10-Q TIMED SPRINT
            </Text>
          </View>
          <Text style={styles.countdownNumber}>{countdown === 0 ? 'START!' : countdown}</Text>
          <Text style={styles.countdownSub}>PACE: {pace.time} PER QUESTION</Text>
        </View>
      )}

      {/* FINAL EXAM SCORECARD MODAL */}
      {phase === 'game_over' && (
        <View style={styles.gameOverOverlay}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.gameOverCard}>
            <View style={styles.trophyContainer}>
              <Trophy size={40} color="#f59e0b" />
            </View>

            <Text style={styles.gameOverTitle}>Exam Sprint Complete!</Text>
            <Text style={styles.gameOverSub}>
              {trackTitle} • {difficulty.toUpperCase()} ({pace.time})
            </Text>

            {/* Scorecard Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Award size={18} color="#818cf8" style={{ marginBottom: 4 }} />
                <Text style={styles.metricValue}>
                  {totalCorrect} / {totalRounds}
                </Text>
                <Text style={styles.metricLabel}>Correct</Text>
              </View>

              <View style={styles.metricBox}>
                <Gauge size={18} color="#10b981" style={{ marginBottom: 4 }} />
                <Text style={styles.metricValue}>{accuracyPct}%</Text>
                <Text style={styles.metricLabel}>Accuracy</Text>
              </View>

              <View style={styles.metricBox}>
                <Clock size={18} color="#f59e0b" style={{ marginBottom: 4 }} />
                <Text style={styles.metricValue}>{avgTimePerQ}s</Text>
                <Text style={styles.metricLabel}>Avg Speed</Text>
              </View>
            </View>

            {/* Question Breakdown Review List */}
            <Text style={styles.reviewHeading}>Question Breakdown</Text>
            <ScrollView style={styles.reviewScroll} showsVerticalScrollIndicator={false}>
              {blitzHistory.map((item, idx) => (
                <View key={idx} style={styles.reviewItem}>
                  <View style={styles.reviewHeaderRow}>
                    <View style={styles.reviewQIndexRow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: item.isCorrect ? '#10b981' : '#ef4444' },
                        ]}
                      />
                      <Text style={styles.reviewQIndex}>Q{idx + 1}</Text>
                      {item.question.examTag && (
                        <Text style={styles.reviewExamTag}>{item.question.examTag}</Text>
                      )}
                    </View>
                    <Text style={styles.reviewTime}>{item.timeTaken}s</Text>
                  </View>

                  <Text style={styles.reviewQText} numberOfLines={2}>
                    {item.question.text}
                  </Text>

                  {item.question.explanation && (
                    <View style={styles.reviewExplanationBox}>
                      <Lightbulb size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                      <Text style={styles.reviewExplanationText}>{item.question.explanation}</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.rematchButton}
                onPress={handleRetakeTest}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.rematchButtonText}>Retake Test</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exitButton} onPress={handleExit} activeOpacity={0.8}>
                <ArrowLeft size={16} color="#94a3b8" style={{ marginRight: 6 }} />
                <Text style={styles.exitButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* TOP: EXAM HEADER & PACING INFORMATION */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.exitIconBtn} onPress={handleExit} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.trackPill}>
          <Text style={styles.trackPillText}>{trackTitle}</Text>
        </View>

        <View
          style={[
            styles.pacePill,
            { borderColor: pace.color + '40', backgroundColor: pace.color + '15' },
          ]}
        >
          <Clock size={11} color={pace.color} style={{ marginRight: 4 }} />
          <Text style={[styles.pacePillText, { color: pace.color }]}>{pace.time}</Text>
        </View>
      </View>

      {/* PROGRESS TRACKER & 10-QUESTION STATUS DOTS */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.questionCounterText}>
            Question {roundNumber} of {totalRounds}
          </Text>

          <Animated.View
            style={[
              styles.timerBadge,
              { borderColor: timerColor + '40', transform: [{ scale: timerPulse }] },
            ]}
          >
            <Timer size={13} color={timerColor} style={{ marginRight: 4 }} />
            <Text style={[styles.timerText, { color: timerColor }]}>{timer}s</Text>
          </Animated.View>
        </View>

        {/* 10 Question Indicator Dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: totalRounds }).map((_, i) => {
            const historyItem = blitzHistory[i];
            const isCurrent = i === roundNumber - 1;

            const dotStyle: any[] = [styles.dot];
            if (historyItem) {
              dotStyle.push(historyItem.isCorrect ? styles.dotCorrect : styles.dotWrong);
            } else if (isCurrent) {
              dotStyle.push(styles.dotCurrent);
            }

            return <View key={i} style={dotStyle} />;
          })}
        </View>

        {/* Linear Question Timer Bar */}
        <View style={styles.timerBarTrack}>
          <View
            style={[
              styles.timerBarFill,
              {
                width: `${Math.max(0, Math.min(100, (timer / (maxTime || 45)) * 100))}%`,
                backgroundColor: timerColor,
              },
            ]}
          />
        </View>
      </View>

      {/* MAIN TEST AREA */}
      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionTagRow}>
            {currentQuestion?.examTag && (
              <View style={styles.examTagBadge}>
                <BookOpen size={11} color="#60a5fa" style={{ marginRight: 4 }} />
                <Text style={styles.examTagText}>{currentQuestion.examTag}</Text>
              </View>
            )}

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {currentQuestion?.category?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQuestion?.text ?? 'Loading question...'}</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {(currentQuestion?.options ?? ['', '', '', '']).map((option, index) => {
            const isSelected = selectedOption === index;
            const isTrueCorrect = index === currentQuestion?.correctIndex;

            const cardStyle: any[] = [styles.optionCard];
            const labelBadgeStyle: any[] = [styles.optionLabelBadge];
            const labelTextStyle: any[] = [styles.optionLabelText];
            const textStyle: any[] = [styles.optionText];
            let StatusIcon = null;

            if (hasAnswered) {
              if (isSelected) {
                if (isCorrect) {
                  cardStyle.push(styles.optionCorrect);
                  textStyle.push(styles.optionTextLight);
                  labelBadgeStyle.push(styles.labelBadgeCorrect);
                  StatusIcon = <Check size={18} color="#ffffff" />;
                } else {
                  cardStyle.push(styles.optionWrong);
                  textStyle.push(styles.optionTextLight);
                  labelBadgeStyle.push(styles.labelBadgeWrong);
                  StatusIcon = <X size={18} color="#ffffff" />;
                }
              } else if (isTrueCorrect) {
                cardStyle.push(styles.optionRevealCorrect);
                textStyle.push(styles.optionTextReveal);
                labelBadgeStyle.push(styles.labelBadgeReveal);
                StatusIcon = <Check size={16} color="#10b981" />;
              } else {
                cardStyle.push(styles.optionDimmed);
              }
            }

            return (
              <TouchableOpacity
                key={`${currentQuestion?.id ?? 'q'}_${index}`}
                style={cardStyle}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.75}
                disabled={hasAnswered || phase !== 'playing'}
              >
                <View style={labelBadgeStyle}>
                  <Text style={labelTextStyle}>{OPTION_LABELS[index]}</Text>
                </View>

                <Text style={textStyle}>{option}</Text>

                {StatusIcon && <View style={styles.statusIconBox}>{StatusIcon}</View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTTOM INFO BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomScoreGroup}>
          <Text style={styles.bottomScoreLabel}>Current Score</Text>
          <Animated.Text style={[styles.bottomScoreValue, { transform: [{ scale: scorePop }] }]}>
            {player1.score}
          </Animated.Text>
        </View>

        <View style={styles.bottomPaceGroup}>
          <Text style={styles.bottomPaceLabel}>Pacing Mode</Text>
          <Text style={[styles.bottomPaceValue, { color: pace.color }]}>{pace.label}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 10,
  },
  exitIconBtn: {
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
    paddingVertical: 5,
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
  pacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  pacePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionCounterText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '900',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dot: {
    width: 26,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dotCurrent: {
    backgroundColor: '#818cf8',
    elevation: 3,
  },
  dotCorrect: {
    backgroundColor: '#10b981',
  },
  dotWrong: {
    backgroundColor: '#ef4444',
  },
  timerBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  questionTagRow: {
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
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
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
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    marginRight: 12,
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
  statusIconBox: {
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomScoreGroup: {},
  bottomScoreLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomScoreValue: {
    color: '#818cf8',
    fontSize: 22,
    fontWeight: '900',
  },
  bottomPaceGroup: {
    alignItems: 'flex-end',
  },
  bottomPaceLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomPaceValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownTrackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  countdownTrackText: {
    color: '#c7d2fe',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countdownNumber: {
    fontSize: 76,
    fontWeight: '900',
    color: '#818cf8',
    textShadowColor: 'rgba(129, 140, 248, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  countdownSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 2,
    marginTop: 8,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  gameOverCard: {
    width: '100%',
    maxHeight: '92%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  trophyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  gameOverTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  gameOverSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 3,
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  reviewHeading: {
    alignSelf: 'flex-start',
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  reviewScroll: {
    width: '100%',
    maxHeight: 180,
    marginBottom: 16,
  },
  reviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewQIndexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reviewQIndex: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewExamTag: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '700',
  },
  reviewTime: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewQText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  reviewExplanationBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  reviewExplanationText: {
    flex: 1,
    color: '#fde68a',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  rematchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 14,
  },
  rematchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exitButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
});
