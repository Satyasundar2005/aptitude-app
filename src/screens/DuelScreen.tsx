import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Timer, Trophy, Swords, Zap, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useGameStore } from '../store/useGameStore';
import { useRewardsStore } from '../store/useRewardsStore';
import PlayerZone from '../components/duel/PlayerZone';
import { KojiTutorModal } from '../components/koji/KojiTutorModal';
import { KojiAvatar } from '../components/koji/KojiAvatar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TRACK_LABELS: Record<string, string> = {
  all: 'ALL-ROUND APTITUDE',
  gate: 'GATE 10-YR PYQS',
  cat: 'CAT QA & DILR',
  placement: 'CAMPUS PLACEMENT',
  banking: 'BANKING & SPEED MATH',
};

export default function DuelScreen() {
  const router = useRouter();
  const {
    mode,
    phase,
    timer,
    maxTime,
    difficulty,
    examTrack,
    currentQuestion,
    player1,
    player2,
    roundNumber,
    totalRounds,
    submitAnswer,
    tickTimer,
    setPhase,
    startDuel,
    startSoloBlitz,
    resetGame,
  } = useGameStore();

  const [countdown, setCountdown] = useState(3);
  const [showKojiModal, setShowKojiModal] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const hasRecordedPointsRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerPulse = useRef(new Animated.Value(1)).current;

  const { recordMatchOutcome } = useRewardsStore();

  // Record points when game over
  useEffect(() => {
    if (phase === 'playing') {
      hasRecordedPointsRef.current = false;
      setPointsAwarded(null);
    } else if (phase === 'game_over' && !hasRecordedPointsRef.current) {
      hasRecordedPointsRef.current = true;
      const isP1Win = mode === 'solo_blitz' ? player2.score > player1.score : player1.score > player2.score;
      const isDraw = player1.score === player2.score;
      const outcome = isP1Win ? 'win' : isDraw ? 'draw' : 'loss';
      const correctCount = mode === 'solo_blitz' ? player2.combo : player1.combo;
      const res = recordMatchOutcome('duel', outcome, { correctCount });
      setPointsAwarded(res.delta);
    }
  }, [phase, player1.score, player2.score, mode]);

  // Countdown timer sequence: 3 -> 2 -> 1 -> GO!
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

  // Pulsing animation when timer is critical (< 10s)
  useEffect(() => {
    if (timer <= 10 && phase === 'playing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerPulse, { toValue: 1.12, duration: 250, useNativeDriver: true }),
          Animated.timing(timerPulse, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else {
      timerPulse.setValue(1);
    }
  }, [timer, phase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRematch = () => {
    if (mode === 'duel') {
      startDuel(difficulty, examTrack);
    } else {
      startSoloBlitz(difficulty, examTrack);
    }
  };

  const handleExit = () => {
    resetGame();
    router.replace('/');
  };

  const bothAnswered = player1.answeredCorrect !== null && player2.answeredCorrect !== null;
  const p1Disabled =
    phase !== 'playing' ||
    player1.answeredCorrect !== null ||
    bothAnswered ||
    mode === 'solo_blitz'; // In solo blitz, CPU is Player 1 at top
  const p2Disabled = phase !== 'playing' || player2.answeredCorrect !== null || bothAnswered;

  const timerColor = timer > 25 ? '#10b981' : timer > 10 ? '#f59e0b' : '#ef4444';
  const trackName = TRACK_LABELS[examTrack] || 'APTITUDE DUEL';

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <StatusBar style="light" />

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownTrackPill}>
            <Sparkles size={14} color="#818cf8" style={{ marginRight: 6 }} />
            <Text style={styles.countdownTrackText}>
              {mode === 'solo_blitz' ? 'SOLO BLITZ • YOU VS CPU' : trackName}
            </Text>
          </View>
          <Text style={styles.countdownNumber}>{countdown === 0 ? 'DUEL!' : countdown}</Text>
          <Text style={styles.countdownSub}>
            {mode === 'solo_blitz' ? 'PLAY AT BOTTOM • BEAT THE CPU' : 'GET READY TO SOLVE'}
          </Text>
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
              {mode === 'solo_blitz'
                ? player2.score > player1.score
                  ? 'YOU DEFEATED THE CPU!'
                  : 'CPU WINS THIS ROUND!'
                : player1.score > player2.score
                  ? 'PLAYER 1 WINS!'
                  : player2.score > player1.score
                    ? 'PLAYER 2 WINS!'
                    : 'PERFECT DRAW!'}
            </Text>

            <Text style={styles.gameOverSub}>
              {timer <= 0 ? 'Time Expired' : 'Round Complete'} • {trackName}
            </Text>

            {/* Matiks Points Reward Badge */}
            {pointsAwarded !== null && (
              <View
                style={[
                  styles.pointsRewardBadge,
                  pointsAwarded >= 0 ? styles.pointsRewardPositive : styles.pointsRewardNegative,
                ]}
              >
                <Trophy size={14} color={pointsAwarded >= 0 ? '#10B981' : '#EF4444'} />
                <Text
                  style={[
                    styles.pointsRewardText,
                    { color: pointsAwarded >= 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {pointsAwarded > 0 ? `+${pointsAwarded}` : pointsAwarded} Matiks Points
                </Text>
              </View>
            )}

            {/* Duel Score Comparison */}
            <View style={styles.scoreRowContainer}>
              <View style={[styles.playerScoreBox, { borderColor: '#818cf8' }]}>
                <Text style={[styles.playerBoxName, { color: '#818cf8' }]}>
                  {mode === 'solo_blitz' ? 'You' : 'Player 1'}
                </Text>
                <Text style={styles.playerBoxScore}>
                  {mode === 'solo_blitz' ? player2.score : player1.score}
                </Text>
                <Text style={styles.playerBoxStreak}>
                  Best Streak: {mode === 'solo_blitz' ? player2.combo : player1.combo}
                </Text>
              </View>

              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              <View style={[styles.playerScoreBox, { borderColor: '#f472b6' }]}>
                <Text style={[styles.playerBoxName, { color: '#f472b6' }]}>
                  {mode === 'solo_blitz' ? 'CPU' : 'Player 2'}
                </Text>
                <Text style={styles.playerBoxScore}>
                  {mode === 'solo_blitz' ? player1.score : player2.score}
                </Text>
                <Text style={styles.playerBoxStreak}>
                  {mode === 'solo_blitz' ? `Round ${roundNumber}` : `Best Streak: ${player2.combo}`}
                </Text>
              </View>
            </View>

            {/* Ask Koji Tutor Button */}
            {currentQuestion && (
              <TouchableOpacity
                style={styles.kojiDuelReviewBtn}
                onPress={() => setShowKojiModal(true)}
                activeOpacity={0.8}
              >
                <KojiAvatar size={24} mood="thoughtful" showBadge={false} />
                <Text style={styles.kojiDuelReviewText}>Ask Koji • Break Down Match Traps</Text>
              </TouchableOpacity>
            )}

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

      {/* Top Timer Bar with Round & Track Info */}
      <View style={styles.topInfoBar}>
        <View style={styles.trackPill}>
          <Text style={styles.trackPillText}>{trackName}</Text>
        </View>

        <Animated.View style={[styles.timerPill, { transform: [{ scale: timerPulse }] }]}>
          <Timer size={14} color={timerColor} style={{ marginRight: 4 }} />
          <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(timer)}</Text>
        </Animated.View>

        <View style={styles.roundPill}>
          <Text style={styles.roundPillText}>
            {mode === 'duel' ? `Q ${roundNumber}/${totalRounds}` : `Round ${roundNumber}`}
          </Text>
        </View>
      </View>

      {/* Progress Line */}
      <View style={styles.timerProgressTrack}>
        <View
          style={[
            styles.timerProgressFill,
            {
              width: `${Math.max(0, Math.min(100, (timer / (maxTime || 60)) * 100))}%`,
              backgroundColor: timerColor,
            },
          ]}
        />
      </View>

      {/* Split Duel Canvas */}
      <View style={styles.splitContainer}>
        {/* Top Player (Rotated 180 deg for table duel) */}
        <View style={styles.playerHalf}>
          <View style={styles.rotatedWrapper}>
            <PlayerZone
              player={player1}
              question={currentQuestion}
              onAnswer={(idx) => submitAnswer(1, idx)}
              accentColor="#818cf8"
              disabled={p1Disabled}
            />
          </View>
        </View>

        {/* Center VS Divider with Live Score Counters */}
        <View style={styles.centerDividerContainer}>
          <View style={styles.dividerLine} />
          <View style={styles.centerBadge}>
            <Text style={styles.centerScoreP1}>
              {mode === 'solo_blitz' ? `CPU: ${player1.score}` : player1.score}
            </Text>
            <View style={styles.swordsIconContainer}>
              <Swords size={14} color="#f59e0b" />
            </View>
            <Text style={styles.centerScoreP2}>
              {mode === 'solo_blitz' ? `YOU: ${player2.score}` : player2.score}
            </Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        {/* Bottom Player */}
        <View style={styles.playerHalf}>
          <PlayerZone
            player={player2}
            question={currentQuestion}
            onAnswer={(idx) => submitAnswer(2, idx)}
            accentColor="#f472b6"
            disabled={p2Disabled}
          />
        </View>
      </View>

      {/* Koji Tutor Modal for Duel Review */}
      <KojiTutorModal
        visible={showKojiModal}
        question={currentQuestion}
        chosenIndex={player1.answeredCorrect === false ? 0 : 1}
        onClose={() => setShowKojiModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 8,
  },
  trackPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  trackPillText: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roundPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roundPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  timerProgressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  timerProgressFill: {
    height: '100%',
  },
  splitContainer: {
    flex: 1,
  },
  playerHalf: {
    flex: 1,
  },
  rotatedWrapper: {
    flex: 1,
    transform: [{ rotate: '180deg' }],
  },
  centerDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  centerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 8,
    marginHorizontal: 8,
  },
  centerScoreP1: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '900',
  },
  swordsIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerScoreP2: {
    color: '#f472b6',
    fontSize: 13,
    fontWeight: '900',
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
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
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
    letterSpacing: 0.5,
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
  kojiDuelReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    marginBottom: 14,
    width: '100%',
  },
  kojiDuelReviewText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '800',
  },
  pointsRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  pointsRewardPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  pointsRewardNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  pointsRewardText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
