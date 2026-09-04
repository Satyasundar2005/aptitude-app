import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  KeyRound,
  Zap,
  Copy,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { Difficulty, ExamTrack } from '../types/game';
import { InfoButton } from '../components/common/InfoButton';
import { FeatureInfoModal } from '../components/common/FeatureInfoModal';
import { FEATURE_EXPLANATIONS } from '../data/featureExplanations';

interface OnlineLobbyModalProps {
  visible: boolean;
  onClose: () => void;
  onStartMatch: () => void;
  selectedTrack: ExamTrack;
  selectedDifficulty: Difficulty;
}

export default function OnlineLobbyModal({
  visible,
  onClose,
  onStartMatch,
  selectedTrack,
  selectedDifficulty,
}: OnlineLobbyModalProps) {
  const { createOnlineRoom, joinOnlineRoom, startQuickMatch, onlineRoom, startOnlineMatch } =
    useGameStore();

  const { profile } = useUserStore();

  const [tab, setTab] = useState<'create' | 'join' | 'quick'>('create');
  const [inputCode, setInputCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeInfoKey, setActiveInfoKey] = useState<string | null>(null);

  const handleCreateRoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const code = createOnlineRoom(selectedDifficulty, selectedTrack, profile.name);
    setCreatedCode(code);
  };

  const handleCopyCode = () => {
    if (!createdCode) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) {
      setErrorMessage('Please enter a valid 6-character room code.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = joinOnlineRoom(inputCode, profile.name);
    if (success) {
      onClose();
      onStartMatch();
    } else {
      setErrorMessage('Room not found. Check the code and try again.');
    }
  };

  const handleQuickMatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startQuickMatch(selectedDifficulty, selectedTrack);
    onClose();
    onStartMatch();
  };

  const handleStartHostMatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startOnlineMatch();
    onClose();
    onStartMatch();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Globe size={20} color="#818cf8" style={{ marginRight: 8 }} />
              <View style={styles.titleWithInfoRow}>
                <Text style={styles.modalTitle}>Play Online With Friends</Text>
                <InfoButton size={12} color="#818cf8" onPress={() => setActiveInfoKey('online_duel')} />
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Mode Tabs: Create / Join / Quick Match */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'create' && styles.tabButtonActive]}
              onPress={() => {
                setTab('create');
                setErrorMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Users
                size={14}
                color={tab === 'create' ? '#ffffff' : '#94a3b8'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
                Create Room
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'join' && styles.tabButtonActive]}
              onPress={() => {
                setTab('join');
                setErrorMessage(null);
              }}
              activeOpacity={0.8}
            >
              <KeyRound
                size={14}
                color={tab === 'join' ? '#ffffff' : '#94a3b8'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
                Join Room
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'quick' && styles.tabButtonActive]}
              onPress={() => {
                setTab('quick');
                setErrorMessage(null);
              }}
              activeOpacity={0.8}
            >
              <Zap
                size={14}
                color={tab === 'quick' ? '#ffffff' : '#94a3b8'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, tab === 'quick' && styles.tabTextActive]}>
                Quick Rival
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            {/* TAB 1: CREATE ROOM */}
            {tab === 'create' && (
              <View style={styles.sectionContainer}>
                <View style={styles.titleWithInfoRow}>
                  <Text style={styles.sectionHeading}>Host a Match for Your Friend</Text>
                  <InfoButton size={11} color="#6366f1" onPress={() => setActiveInfoKey('online_create_room')} />
                </View>

                {createdCode ? (
                  <View style={styles.codeGeneratedCard}>
                    <Text style={styles.codeLabel}>ROOM CODE</Text>
                    <View style={styles.codeDisplayRow}>
                      <Text style={styles.codeText}>{createdCode}</Text>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleCopyCode}
                        activeOpacity={0.7}
                      >
                        {copied ? (
                          <Check size={16} color="#10b981" />
                        ) : (
                          <Copy size={16} color="#ffffff" />
                        )}
                        <Text style={[styles.copyText, copied && { color: '#10b981' }]}>
                          {copied ? 'Copied!' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.waitingPill}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.waitingText}>Waiting for friend to enter code...</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.startDuelBtn}
                      onPress={handleStartHostMatch}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startDuelBtnText}>Start Match Now</Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButtonPrimary}
                    onPress={handleCreateRoom}
                    activeOpacity={0.85}
                  >
                    <Sparkles size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>Generate Private Room Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* TAB 2: JOIN ROOM */}
            {tab === 'join' && (
              <View style={styles.sectionContainer}>
                <View style={styles.titleWithInfoRow}>
                  <Text style={styles.sectionHeading}>Enter Friend's Room Code</Text>
                  <InfoButton size={11} color="#a855f7" onPress={() => setActiveInfoKey('online_join_room')} />
                </View>

                <TextInput
                  style={styles.inputCode}
                  placeholder="e.g. GATE-492"
                  placeholderTextColor="#64748b"
                  value={inputCode}
                  onChangeText={(text) => {
                    setInputCode(text.toUpperCase());
                    setErrorMessage(null);
                  }}
                  autoCapitalize="characters"
                  maxLength={10}
                />

                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={handleJoinRoom}
                  activeOpacity={0.85}
                >
                  <KeyRound size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Join Friend's Room</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 3: QUICK MATCH */}
            {tab === 'quick' && (
              <View style={styles.sectionContainer}>
                <View style={styles.titleWithInfoRow}>
                  <Text style={styles.sectionHeading}>Match with an Online Aspirant</Text>
                  <InfoButton size={11} color="#10b981" onPress={() => setActiveInfoKey('online_quick_match')} />
                </View>

                <View style={styles.quickFeaturesBox}>
                  <View style={styles.featureRow}>
                    <ShieldCheck size={16} color="#10b981" style={{ marginRight: 8 }} />
                    <Text style={styles.featureText}>Real-time speed & accuracy scoring</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <ShieldCheck size={16} color="#10b981" style={{ marginRight: 8 }} />
                    <Text style={styles.featureText}>Same 10 curated questions & timer</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <ShieldCheck size={16} color="#10b981" style={{ marginRight: 8 }} />
                    <Text style={styles.featureText}>
                      Authentic {selectedTrack.toUpperCase()} PYQ challenge
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={handleQuickMatch}
                  activeOpacity={0.85}
                >
                  <Zap size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Find Online Match</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Feature Information Modal */}
      <FeatureInfoModal
        visible={!!activeInfoKey}
        onClose={() => setActiveInfoKey(null)}
        info={activeInfoKey ? FEATURE_EXPLANATIONS[activeInfoKey] : null}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  tabContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
    textAlign: 'center',
  },
  sectionSub: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeGeneratedCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  codeLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  codeText: {
    color: '#818cf8',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  waitingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 18,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginRight: 8,
  },
  waitingText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
  },
  startDuelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    gap: 8,
  },
  startDuelBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  inputCode: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickFeaturesBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  titleWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
});
