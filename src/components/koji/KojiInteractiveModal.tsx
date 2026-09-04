import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Trophy,
  ArrowRight,
  MessageSquare,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { KojiAvatar } from './KojiAvatar';
import { Question } from '../../types/game';
import {
  KojiChatMessage,
  MistakeItem,
  getSimplifiedConcept,
  createInitialConversation,
  answerUserDoubt,
  SimplifiedConcept,
} from '../../services/kojiChatService';

interface Props {
  visible: boolean;
  mistakes?: MistakeItem[];
  question?: Question | null;
  chosenIndex?: number | null;
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const KojiInteractiveModal: React.FC<Props> = ({
  visible,
  mistakes: propMistakes,
  question,
  chosenIndex,
  initialIndex = 0,
  onClose,
}) => {
  // Normalize mistakes list: either an array of mistakes or a single question
  const activeMistakes: MistakeItem[] = React.useMemo(() => {
    if (propMistakes && propMistakes.length > 0) {
      return propMistakes;
    }
    if (question) {
      return [
        {
          question,
          chosenIndex: chosenIndex ?? 0,
        },
      ];
    }
    return [];
  }, [propMistakes, question, chosenIndex]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [conversations, setConversations] = useState<Record<string, KojiChatMessage[]>>({});
  const [userInput, setUserInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activeConceptTab, setActiveConceptTab] = useState<
    'intuition' | 'analogy' | 'eli5' | 'formula'
  >('intuition');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [masteredMistakeIds, setMasteredMistakeIds] = useState<Record<string, boolean>>({});

  const chatScrollRef = useRef<ScrollView>(null);

  // Sync initial index
  useEffect(() => {
    if (visible) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, activeMistakes.length - 1)));
      setShowCelebration(false);
    }
  }, [visible, initialIndex, activeMistakes.length]);

  const currentMistake = activeMistakes[currentIndex];
  const qId = currentMistake?.question?.id || `idx-${currentIndex}`;

  // Initialize conversation for the current question if not yet created
  useEffect(() => {
    if (!currentMistake || !visible) return;
    if (!conversations[qId]) {
      const initialMsgs = createInitialConversation(
        currentMistake.question,
        currentMistake.chosenIndex,
        currentMistake.roundNumber ?? currentIndex + 1
      );
      setConversations((prev) => ({ ...prev, [qId]: initialMsgs }));
    }
  }, [currentMistake, qId, visible, conversations, currentIndex]);

  const currentChat = conversations[qId] || [];

  // Scroll to bottom whenever chat updates
  useEffect(() => {
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [currentChat, isThinking]);

  if (!visible || activeMistakes.length === 0 || !currentMistake) {
    return null;
  }

  const { question: curQ, chosenIndex: curChosen } = currentMistake;
  const chosenWrong = curQ.options[curChosen] || 'your choice';
  const correctAnswer = curQ.options[curQ.correctIndex] || 'the correct answer';
  const concept: SimplifiedConcept = getSimplifiedConcept(
    curQ.category,
    curQ.text,
    chosenWrong,
    correctAnswer
  );

  const handleSendDoubt = async (doubtText?: string) => {
    const textToSend = (doubtText || userInput).trim();
    if (!textToSend || isThinking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const userMsg: KojiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const updatedHistory = [...currentChat, userMsg];
    setConversations((prev) => ({ ...prev, [qId]: updatedHistory }));
    setUserInput('');
    setIsThinking(true);

    try {
      const kojiReply = await answerUserDoubt({
        question: curQ,
        chosenIndex: curChosen,
        userDoubt: textToSend,
        history: updatedHistory,
      });

      setConversations((prev) => ({
        ...prev,
        [qId]: [...(prev[qId] || updatedHistory), kojiReply],
      }));
    } catch {
      const fallbackReply: KojiChatMessage = {
        id: `koji-err-${Date.now()}`,
        sender: 'koji',
        text: `Don't worry! Here is the bottom line: **${concept.oneLineIntuition}**.\n\nKeep practicing this pattern!`,
        timestamp: Date.now(),
      };
      setConversations((prev) => ({
        ...prev,
        [qId]: [...(prev[qId] || updatedHistory), fallbackReply],
      }));
    } finally {
      setIsThinking(false);
    }
  };

  const handleNextMistake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setMasteredMistakeIds((prev) => ({ ...prev, [qId]: true }));

    if (currentIndex + 1 < activeMistakes.length) {
      setCurrentIndex(currentIndex + 1);
      setActiveConceptTab('intuition');
    } else {
      setShowCelebration(true);
    }
  };

  const handlePrevMistake = () => {
    if (currentIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setCurrentIndex(currentIndex - 1);
      setActiveConceptTab('intuition');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContainer}>
            {/* TOP HEADER */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <KojiAvatar
                  size={38}
                  mood={showCelebration ? 'celebrating' : 'thoughtful'}
                  showBadge={false}
                />
                <View>
                  <View style={styles.tutorTag}>
                    <Sparkles size={11} color="#06B6D4" />
                    <Text style={styles.tutorTagText}>KOJI 1-ON-1 CLINIC</Text>
                  </View>
                  <Text style={styles.headerTitle}>Interactive Doubts & Tutor</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* MULTI-MISTAKE NAVIGATION STEPPER */}
            {activeMistakes.length > 1 && !showCelebration && (
              <View style={styles.stepperBar}>
                <TouchableOpacity
                  style={[styles.stepperArrow, currentIndex === 0 && styles.stepperArrowDisabled]}
                  onPress={handlePrevMistake}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={16} color={currentIndex === 0 ? '#475569' : '#94A3B8'} />
                  <Text
                    style={[
                      styles.stepperArrowText,
                      currentIndex === 0 && styles.stepperArrowTextDisabled,
                    ]}
                  >
                    Prev
                  </Text>
                </TouchableOpacity>

                <View style={styles.stepperCenter}>
                  <Text style={styles.stepperTitle}>
                    Mistake {currentIndex + 1} of {activeMistakes.length}
                  </Text>
                  <View style={styles.stepperDotsRow}>
                    {activeMistakes.map((m, idx) => {
                      const isCur = idx === currentIndex;
                      const isMastered = masteredMistakeIds[m.question.id || `idx-${idx}`];
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.stepperDot,
                            isCur && styles.stepperDotActive,
                            isMastered && styles.stepperDotMastered,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>

                <TouchableOpacity style={styles.stepperArrow} onPress={handleNextMistake}>
                  <Text style={styles.stepperArrowText}>
                    {currentIndex + 1 < activeMistakes.length ? 'Next' : 'Finish'}
                  </Text>
                  <ChevronRight size={16} color="#06B6D4" />
                </TouchableOpacity>
              </View>
            )}

            {/* MAIN CONTENT: CELEBRATION OR TUTOR SESSION */}
            {showCelebration ? (
              <View style={styles.celebrationContainer}>
                <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.celebrationCard}>
                  <View style={styles.celebrationIconWrap}>
                    <Trophy size={48} color="#F59E0B" />
                  </View>
                  <Text style={styles.celebrationTitle}>All Traps Conquered!</Text>
                  <Text style={styles.celebrationSub}>
                    You went through all {activeMistakes.length} mistaken questions with Koji.
                    Understanding the traps guarantees you won't repeat them on exam day!
                  </Text>

                  <View style={styles.celebrationStats}>
                    <View style={styles.celebrationStatBox}>
                      <CheckCircle2 size={18} color="#10B981" />
                      <Text style={styles.celebrationStatNumber}>{activeMistakes.length}</Text>
                      <Text style={styles.celebrationStatLabel}>Concepts Reviewed</Text>
                    </View>
                    <View style={styles.celebrationStatBox}>
                      <Sparkles size={18} color="#06B6D4" />
                      <Text style={styles.celebrationStatNumber}>+30 XP</Text>
                      <Text style={styles.celebrationStatLabel}>Tutor Mastery</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.celebrationBtn}
                    onPress={onClose}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.celebrationBtnText}>Back to Dashboard</Text>
                    <ArrowRight size={16} color="#0F172A" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              <ScrollView
                ref={chatScrollRef}
                style={styles.scrollBody}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* 1. COMPACT QUESTION & ANSWER COMPARISON CARD */}
                <View style={styles.questionCard}>
                  <View style={styles.qMetaRow}>
                    <Text style={styles.qCategoryTag}>
                      {curQ.category.replace('_', ' ').toUpperCase()}
                    </Text>
                    {curQ.examTag && <Text style={styles.qExamTag}>{curQ.examTag}</Text>}
                  </View>

                  <Text style={styles.questionText}>{curQ.text}</Text>

                  {/* Contrast Pill */}
                  <View style={styles.contrastPillRow}>
                    <View style={[styles.contrastPill, styles.contrastPillWrong]}>
                      <XCircle size={13} color="#EF4444" />
                      <Text style={styles.contrastPillLabel}>You picked:</Text>
                      <Text style={styles.contrastPillValueWrong} numberOfLines={1}>
                        {chosenWrong}
                      </Text>
                    </View>

                    <View style={[styles.contrastPill, styles.contrastPillCorrect]}>
                      <CheckCircle2 size={13} color="#10B981" />
                      <Text style={styles.contrastPillLabel}>Correct:</Text>
                      <Text style={styles.contrastPillValueCorrect} numberOfLines={1}>
                        {correctAnswer}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 2. KOJI'S SIMPLIFIED CONCEPT EXPLORER */}
                <View style={styles.conceptCard}>
                  <View style={styles.conceptHeaderRow}>
                    <View style={styles.conceptHeaderLeft}>
                      <Lightbulb size={16} color="#06B6D4" />
                      <Text style={styles.conceptHeadline}>{concept.headline}</Text>
                    </View>
                  </View>

                  {/* Concept Interactive Tabs */}
                  <View style={styles.tabRow}>
                    <TouchableOpacity
                      style={[
                        styles.tabBtn,
                        activeConceptTab === 'intuition' && styles.tabBtnActive,
                      ]}
                      onPress={() => setActiveConceptTab('intuition')}
                    >
                      <Text
                        style={[
                          styles.tabBtnText,
                          activeConceptTab === 'intuition' && styles.tabBtnTextActive,
                        ]}
                      >
                        💡 Core Intuition
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tabBtn, activeConceptTab === 'analogy' && styles.tabBtnActive]}
                      onPress={() => setActiveConceptTab('analogy')}
                    >
                      <Text
                        style={[
                          styles.tabBtnText,
                          activeConceptTab === 'analogy' && styles.tabBtnTextActive,
                        ]}
                      >
                        🏎️ Real-World Analogy
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tabBtn, activeConceptTab === 'eli5' && styles.tabBtnActive]}
                      onPress={() => setActiveConceptTab('eli5')}
                    >
                      <Text
                        style={[
                          styles.tabBtnText,
                          activeConceptTab === 'eli5' && styles.tabBtnTextActive,
                        ]}
                      >
                        👶 Simplify (ELI5)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tabBtn, activeConceptTab === 'formula' && styles.tabBtnActive]}
                      onPress={() => setActiveConceptTab('formula')}
                    >
                      <Text
                        style={[
                          styles.tabBtnText,
                          activeConceptTab === 'formula' && styles.tabBtnTextActive,
                        ]}
                      >
                        📐 Formula Breakdown
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Active Concept Explanation Box */}
                  <View style={styles.activeConceptBox}>
                    {activeConceptTab === 'intuition' && (
                      <Text style={styles.conceptBodyText}>{concept.oneLineIntuition}</Text>
                    )}
                    {activeConceptTab === 'analogy' && (
                      <Text style={styles.conceptBodyText}>{concept.everydayAnalogy}</Text>
                    )}
                    {activeConceptTab === 'eli5' && (
                      <Text style={styles.conceptBodyText}>{concept.eli5Explanation}</Text>
                    )}
                    {activeConceptTab === 'formula' && (
                      <Text style={styles.conceptBodyText}>{concept.formulaBreakdown}</Text>
                    )}
                  </View>
                </View>

                {/* 3. INTERACTIVE CHAT & DOUBTS SECTION */}
                <View style={styles.chatSectionHeader}>
                  <MessageSquare size={14} color="#818CF8" />
                  <Text style={styles.chatSectionTitle}>Ask Doubts & Clarifications</Text>
                </View>

                <View style={styles.chatThread}>
                  {currentChat.map((msg) => {
                    const isKoji = msg.sender === 'koji';
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.chatBubbleRow,
                          isKoji ? styles.bubbleRowKoji : styles.bubbleRowUser,
                        ]}
                      >
                        {isKoji && (
                          <View style={styles.kojiBubbleAvatarWrap}>
                            <KojiAvatar size={24} mood="curious" showBadge={false} />
                          </View>
                        )}

                        <View
                          style={[
                            styles.chatBubble,
                            isKoji ? styles.chatBubbleKoji : styles.chatBubbleUser,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chatText,
                              isKoji ? styles.chatTextKoji : styles.chatTextUser,
                            ]}
                          >
                            {msg.text}
                          </Text>

                          {/* Quick Suggested Doubt Chips on Latest Message */}
                          {isKoji &&
                            msg.suggestedQuestions &&
                            msg.suggestedQuestions.length > 0 && (
                              <View style={styles.suggestedChipsWrap}>
                                <Text style={styles.suggestedLabel}>
                                  💡 Tap a quick doubt to ask:
                                </Text>
                                <View style={styles.chipsRow}>
                                  {msg.suggestedQuestions.map((chip, idx) => (
                                    <TouchableOpacity
                                      key={idx}
                                      style={styles.chipBtn}
                                      onPress={() => handleSendDoubt(chip)}
                                      activeOpacity={0.7}
                                      disabled={isThinking}
                                    >
                                      <Text style={styles.chipText}>{chip}</Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </View>
                            )}
                        </View>
                      </View>
                    );
                  })}

                  {/* Typing / Thinking Indicator */}
                  {isThinking && (
                    <View style={[styles.chatBubbleRow, styles.bubbleRowKoji]}>
                      <View style={styles.kojiBubbleAvatarWrap}>
                        <KojiAvatar size={24} mood="thoughtful" showBadge={false} />
                      </View>
                      <View
                        style={[styles.chatBubble, styles.chatBubbleKoji, styles.thinkingBubble]}
                      >
                        <ActivityIndicator size="small" color="#06B6D4" />
                        <Text style={styles.thinkingText}>
                          Koji is formulating an intuitive answer...
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. UNDERSTAND & ADVANCE BUTTON */}
                <TouchableOpacity
                  style={styles.understandBtn}
                  onPress={handleNextMistake}
                  activeOpacity={0.85}
                >
                  <Text style={styles.understandBtnText}>
                    {currentIndex + 1 < activeMistakes.length
                      ? 'I Understand! Next Mistake ➔'
                      : 'I Mastered This! Complete Clinic ➔'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* 5. USER DOUBT INPUT BAR (WHEN NOT CELEBRATING) */}
            {!showCelebration && (
              <View style={styles.inputBarContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask Koji any doubt or follow-up question..."
                  placeholderTextColor="#64748B"
                  value={userInput}
                  onChangeText={setUserInput}
                  onSubmitEditing={() => handleSendDoubt()}
                  returnKeyType="send"
                  multiline={false}
                  editable={!isThinking}
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    (!userInput.trim() || isThinking) && styles.sendBtnDisabled,
                  ]}
                  onPress={() => handleSendDoubt()}
                  disabled={!userInput.trim() || isThinking}
                  activeOpacity={0.75}
                >
                  <Send size={16} color={userInput.trim() ? '#0F172A' : '#475569'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 18, 0.88)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '92%',
    borderWidth: 1,
    borderColor: '#334155',
    display: 'flex',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tutorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tutorTagText: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#131D33',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  stepperArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stepperArrowDisabled: {
    opacity: 0.4,
  },
  stepperArrowText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '700',
  },
  stepperArrowTextDisabled: {
    color: '#475569',
  },
  stepperCenter: {
    alignItems: 'center',
  },
  stepperTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepperDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepperDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  stepperDotActive: {
    backgroundColor: '#06B6D4',
    width: 16,
  },
  stepperDotMastered: {
    backgroundColor: '#10B981',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  qMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qCategoryTag: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qExamTag: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 10,
  },
  contrastPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contrastPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
  },
  contrastPillWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  contrastPillCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  contrastPillLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  contrastPillValueWrong: {
    flex: 1,
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
  },
  contrastPillValueCorrect: {
    flex: 1,
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  conceptCard: {
    backgroundColor: '#17233D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2563EB40',
  },
  conceptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  conceptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  conceptHeadline: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tabBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06B6D4',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#06B6D4',
  },
  activeConceptBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  conceptBodyText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  chatSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  chatSectionTitle: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chatThread: {
    gap: 12,
    marginBottom: 16,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubbleRowKoji: {
    justifyContent: 'flex-start',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  kojiBubbleAvatarWrap: {
    marginTop: 4,
  },
  chatBubble: {
    maxWidth: SCREEN_WIDTH * 0.78,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chatBubbleKoji: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chatBubbleUser: {
    backgroundColor: '#0284C7',
    borderTopRightRadius: 4,
  },
  chatText: {
    fontSize: 12,
    lineHeight: 18,
  },
  chatTextKoji: {
    color: '#F1F5F9',
  },
  chatTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  thinkingText: {
    color: '#06B6D4',
    fontSize: 11,
    fontStyle: 'italic',
  },
  suggestedChipsWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  suggestedLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#06B6D450',
  },
  chipText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
  understandBtn: {
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  understandBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#1E293B',
  },
  celebrationContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  celebrationCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  celebrationIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  celebrationSub: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  celebrationStats: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  celebrationStatBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 110,
  },
  celebrationStatNumber: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  celebrationStatLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  celebrationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  celebrationBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
});
