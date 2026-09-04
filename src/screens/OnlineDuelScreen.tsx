import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Timer,
  Trophy,
  Swords,
  Zap,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  BookOpen,
  User,
  Users,
  Flame,
  Award,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/useGameStore';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function OnlineDuelScreen() {
  const router = useRouter();
  const {
    phase,
    timer,
    maxTime,
    difficulty,
    examTrack,
    currentQuestion,
    player1,
    player2,
    onlineRoom,
    roundNumber,
    totalRounds,
    submitAnswer,
    tickTimer,
    setPhase,
    startQuickMatch,
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

  // Pulse timer when < 10s
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

  const handleRematch = () => {
    startQuickMatch(difficulty, examTrack);
  };

  const handleExit = () => {
    resetGame();
    router.replace('/');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timer > 25 ? '#10b981' : timer > 10 ? '#f59e0b' : '#ef4444';
  const hasAnswered = player1.answeredCorrect !== null;
  const isCorrect = player1.answeredCorrect === true;
  const scoreDiff = player1.score - player2.score;

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <StatusBar style="light" />

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownTrackPill}>
            <Sparkles size={14} color="#818cf8" style={{ marginRight: 6 }} />
            <Text style={styles.countdownTrackText}>
              ONLINE DUEL • {onlineRoom?.roomCode || 'LIVE'}
            </Text>
          </View>
          <Text style={styles.countdownNumber}>{countdown === 0 ? 'GO!' : countdown}</Text>
          <Text style={styles.countdownSub}>OUTSMART YOUR RIVAL</Text>
        </View>
      )}

      {/* Game Over modal overlay */}
      {phase === 'game_over' && (
        <View style={styles.gameOverOverlay}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.gameOverCard}>
            <View style={styles.trophyContainer}>
              <Trophy size={40} color="#f59e0b" />
            </View>

            <Text style={styles.gameOverTitle}>
              {player1.score > player2.score
                ? 'VICTORY! YOU WON!'
                : player2.score > player1.score
                  ? `${player2.name.toUpperCase()} WINS!`
                  : 'PERFECT DRAW!'}
            </Text>

            <Text style={styles.gameOverSub}>
              Online Duel Completed • {examTrack.toUpperCase()}
            </Text>

            {/* Final Scores Comparison */}
            <View style={styles.scoreRowContainer}>
              <View style={[styles.playerScoreBox, { borderColor: '#818cf8' }]}>
                <Text style={[styles.playerBoxName, { color: '#818cf8' }]}>You</Text>
                <Text style={styles.playerBoxScore}>{player1.score}</Text>
                <Text style={styles.playerBoxStreak}>Best Streak: {player1.combo}</Text>
              </View>

              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              <View style={[styles.playerScoreBox, { borderColor: '#f472b6' }]}>
                <Text style={[styles.playerBoxName, { color: '#f472b6' }]}>{player2.name}</Text>
                <Text style={styles.playerBoxScore}>{player2.score}</Text>
                <Text style={styles.playerBoxStreak}>Best Streak: {player2.combo}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.rematchButton}
                onPress={handleRematch}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.rematchButtonText}>Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exitButton} onPress={handleExit} activeOpacity={0.8}>
                <ArrowLeft size={16} color="#94a3b8" style={{ marginRight: 6 }} />
                <Text style={styles.exitButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* TOP: LIVE OPPONENT / FRIEND CARD */}
      <View style={styles.opponentCard}>
        <View style={styles.opponentMetaRow}>
          <View style={styles.opponentAvatarCircle}>
            <User size={16} color="#f472b6" />
          </View>
          <View style={styles.opponentNameBlock}>
            <View style={styles.opponentNameLine}>
              <Text style={styles.opponentName}>{player2.name}</Text>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.opponentStatusText}>
              {player2.answeredCorrect === true
                ? 'Answered Correctly ✓'
                : player2.answeredCorrect === false
                  ? 'Answered Incorrectly ✗'
                  : 'Thinking...'}
            </Text>
          </View>

          {/* Opponent Score Badge */}
          <View style={styles.opponentScoreBadge}>
            <Text style={styles.opponentScoreNumber}>{player2.score}</Text>
            <Text style={styles.opponentScoreLabel}>pts</Text>
          </View>
        </View>

        {/* Live Score Differential Pill */}
        <View style={styles.scoreDifferentialRow}>
          <Text style={styles.scoreDiffText}>
            {scoreDiff > 0
              ? `You are +${scoreDiff} pts ahead!`
              : scoreDiff < 0
                ? `${player2.name} is +${Math.abs(scoreDiff)} pts ahead`
                : 'Scores are tied!'}
          </Text>
        </View>
      </View>

      {/* MIDDLE: TIMER, QUESTION PROGRESS & EXAM TAG */}
      <View style={styles.middleMetaBar}>
        <View style={styles.roundPill}>
          <Text style={styles.roundPillText}>
            Q {roundNumber} / {totalRounds}
          </Text>
        </View>

        <Animated.View style={[styles.timerPill, { transform: [{ scale: timerPulse }] }]}>
          <Timer size={14} color={timerColor} style={{ marginRight: 4 }} />
          <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(timer)}</Text>
        </Animated.View>

        {currentQuestion?.examTag && (
          <View style={styles.examTagPill}>
            <BookOpen size={11} color="#60a5fa" style={{ marginRight: 4 }} />
            <Text style={styles.examTagText}>{currentQuestion.examTag}</Text>
          </View>
        )}
      </View>

      {/* QUESTION & OPTIONS CANVAS */}
      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          {currentQuestion?.examTag && (
            <View style={styles.questionTagBadge}>
              <BookOpen size={11} color="#60a5fa" style={{ marginRight: 5 }} />
              <Text style={styles.questionTagText}>{currentQuestion.examTag}</Text>
            </View>
          )}
          <Text style={styles.questionText}>
            {currentQuestion?.text ?? 'Preparing question...'}
          </Text>
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

      {/* BOTTOM: YOUR PLAYER SCORE & STATUS BAR */}
      <View style={styles.yourBottomBar}>
        <View style={styles.yourMetaRow}>
          <View style={styles.yourAvatarCircle}>
            <Award size={16} color="#818cf8" />
          </View>
          <View>
            <Text style={styles.yourName}>You</Text>
            {player1.streak > 1 && (
              <View style={styles.streakTag}>
                <Flame size={11} color="#f59e0b" />
                <Text style={styles.streakText}>{player1.streak} streak</Text>
              </View>
            )}
          </View>
        </View>

        <Animated.View style={[styles.yourScoreBadge, { transform: [{ scale: scorePop }] }]}>
          <Text style={styles.yourScoreText}>{player1.score}</Text>
          <Text style={styles.yourScoreLabel}>pts</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  opponentCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  opponentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opponentAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
    borderWidth: 1.5,
    borderColor: '#f472b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opponentNameBlock: {
    flex: 1,
    marginLeft: 12,
  },
  opponentNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  opponentName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  opponentStatusText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  opponentScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 114, 182, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 3,
  },
  opponentScoreNumber: {
    color: '#f472b6',
    fontSize: 18,
    fontWeight: '900',
  },
  opponentScoreLabel: {
    color: '#f472b6',
    fontSize: 10,
    fontWeight: '700',
  },
  scoreDifferentialRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  scoreDiffText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  middleMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  roundPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roundPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  examTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  examTagText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '800',
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  questionTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 10,
  },
  questionTagText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  questionText: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
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
    width: 26,
    height: 26,
    borderRadius: 13,
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
    fontSize: 12,
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
  yourBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  yourMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yourAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1.5,
    borderColor: '#818cf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yourName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
  },
  yourScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  yourScoreText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  yourScoreLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
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
    fontSize: 84,
    fontWeight: '900',
    color: '#818cf8',
    textShadowColor: 'rgba(129, 140, 248, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  countdownSub: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 3,
    marginTop: 8,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  gameOverCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  trophyContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  gameOverSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 20,
  },
  scoreRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  playerScoreBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
  },
  playerBoxName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  playerBoxScore: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  playerBoxStreak: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
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
