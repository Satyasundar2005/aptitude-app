import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, X, Flame, Zap, Award, BookOpen } from 'lucide-react-native';
import { PlayerState, Question } from '../../types/game';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlayerZoneProps {
  player: PlayerState;
  question: Question | null;
  onAnswer: (answerIndex: number) => void;
  accentColor: string;
  disabled: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function PlayerZone({
  player,
  question,
  onAnswer,
  accentColor,
  disabled,
}: PlayerZoneProps) {
  const shakeX = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const scorePop = useRef(new Animated.Value(1)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const prevQuestionId = useRef<string | null>(null);
  const prevCorrect = useRef<boolean | null>(null);

  // Reset selected answer on new question
  useEffect(() => {
    if (question?.id !== prevQuestionId.current) {
      setSelectedAnswerIndex(null);
      prevQuestionId.current = question?.id ?? null;
    }
  }, [question?.id]);

  // Streak pulse animation when streak >= 2
  useEffect(() => {
    if (player.streak >= 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(streakPulse, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(streakPulse, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      streakPulse.setValue(1);
    }
  }, [player.streak]);

  // Handle score pop and shake haptics
  useEffect(() => {
    if (player.answeredCorrect === true && prevCorrect.current !== true) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.timing(scorePop, { toValue: 1.35, duration: 150, useNativeDriver: true }),
        Animated.spring(scorePop, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    } else if (player.answeredCorrect === false && prevCorrect.current !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -14, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 14, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -9, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 9, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
    prevCorrect.current = player.answeredCorrect;
  }, [player.answeredCorrect]);

  const handleSelect = (index: number) => {
    if (disabled || selectedAnswerIndex !== null) return;
    setSelectedAnswerIndex(index);
    onAnswer(index);
  };

  const flashColor =
    player.answeredCorrect === true ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';

  const multiplierLabel =
    player.multiplier >= 4
      ? '4X MEGA'
      : player.multiplier >= 3
        ? '3X SUPER'
        : player.multiplier >= 2
          ? '2X COMBO'
          : '';

  return (
    <View style={styles.container}>
      {/* Answer flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: flashColor, opacity: flashOpacity, zIndex: 1 },
        ]}
      />

      {/* Header: Player Name, Multiplier, Streak, Score */}
      <View style={styles.header}>
        <View style={styles.playerMeta}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: accentColor + '25', borderColor: accentColor },
            ]}
          >
            <Award size={14} color={accentColor} />
          </View>
          <Text style={[styles.playerName, { color: accentColor }]}>{player.name}</Text>

          {multiplierLabel !== '' && (
            <View style={[styles.multiplierBadge, { backgroundColor: accentColor }]}>
              <Zap size={10} color="#ffffff" />
              <Text style={styles.multiplierText}>{multiplierLabel}</Text>
            </View>
          )}

          {player.streak > 1 && (
            <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakPulse }] }]}>
              <Flame size={12} color="#f59e0b" />
              <Text style={styles.streakText}>{player.streak}</Text>
            </Animated.View>
          )}
        </View>

        <Animated.View
          style={[
            styles.scoreBadge,
            { backgroundColor: accentColor, transform: [{ scale: scorePop }] },
          ]}
        >
          <Text style={styles.scoreText}>{player.score}</Text>
        </Animated.View>
      </View>

      {/* Question Card with Exam Source Tag */}
      <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeX }] }]}>
        {question?.examTag && (
          <View style={styles.examTagBadge}>
            <BookOpen size={11} color="#60a5fa" style={{ marginRight: 4 }} />
            <Text style={styles.examTagText}>{question.examTag}</Text>
          </View>
        )}

        <Text style={styles.questionText} numberOfLines={3} adjustsFontSizeToFit>
          {question?.text ?? 'Preparing question...'}
        </Text>
      </Animated.View>

      {/* Options 2x2 Grid with A/B/C/D labels & accurate feedback */}
      <View style={styles.optionsGrid}>
        {(question?.options ?? ['', '', '', '']).map((option, index) => {
          const isSelected = selectedAnswerIndex === index;
          const isCorrectAnswer = question && index === question.correctIndex;
          const hasAnswered = player.answeredCorrect !== null;

          // Determine button visual state
          const buttonStyle: any[] = [styles.optionButton];
          const labelBadgeStyle: any[] = [styles.optionLabelBadge];
          const labelTextStyle: any[] = [styles.optionLabelText];
          const optionTextStyle: any[] = [styles.optionText];
          let StatusIcon = null;

          if (hasAnswered) {
            if (isSelected) {
              if (player.answeredCorrect === true) {
                // User picked right!
                buttonStyle.push(styles.optionCorrect);
                optionTextStyle.push(styles.optionTextHighlighted);
                StatusIcon = <Check size={16} color="#ffffff" />;
              } else {
                // User picked wrong!
                buttonStyle.push(styles.optionWrong);
                optionTextStyle.push(styles.optionTextHighlighted);
                StatusIcon = <X size={16} color="#ffffff" />;
              }
            } else if (isCorrectAnswer) {
              // Show the correct answer in green outline so they learn
              buttonStyle.push(styles.optionRevealCorrect);
              StatusIcon = <Check size={14} color="#10b981" />;
            } else {
              buttonStyle.push(styles.optionDimmed);
            }
          }

          return (
            <TouchableOpacity
              key={`${question?.id ?? 'q'}_${index}`}
              style={buttonStyle}
              onPress={() => handleSelect(index)}
              activeOpacity={0.7}
              disabled={disabled || hasAnswered}
            >
              <View style={styles.optionContentRow}>
                <View style={labelBadgeStyle}>
                  <Text style={labelTextStyle}>{OPTION_LABELS[index]}</Text>
                </View>
                <Text style={optionTextStyle} numberOfLines={2} adjustsFontSizeToFit>
                  {option}
                </Text>
                {StatusIcon && <View style={styles.statusIconContainer}>{StatusIcon}</View>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  multiplierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  multiplierText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  questionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 74,
    justifyContent: 'center',
  },
  examTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  examTagText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: 23,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  optionButton: {
    width: '48.5%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
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
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabelBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  optionLabelText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  optionTextHighlighted: {
    color: '#ffffff',
    fontWeight: '900',
  },
  statusIconContainer: {
    marginLeft: 4,
  },
});
