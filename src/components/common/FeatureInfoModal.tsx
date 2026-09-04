import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Lightbulb,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export interface FeatureInfoData {
  title: string;
  tag?: string;
  summary: string;
  howItWorks?: string[];
  tips?: string;
  accentColor?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  info: FeatureInfoData | null;
}

export const FeatureInfoModal: React.FC<Props> = ({ visible, onClose, info }) => {
  if (!info) return null;

  const accent = info.accentColor || '#38BDF8';

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#1E293B', '#0F172A']}
                style={[styles.modalCardGradient, { borderColor: accent + '60' }]}
              >
                {/* Header Row */}
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View style={[styles.infoIconCircle, { backgroundColor: accent + '20' }]}>
                      <Info size={20} color={accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      {info.tag && (
                        <Text style={[styles.featureTag, { color: accent }]}>
                          {info.tag.toUpperCase()}
                        </Text>
                      )}
                      <Text style={styles.featureTitle} numberOfLines={2}>
                        {info.title}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={handleClose}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <X size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.scrollArea}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Summary Box */}
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>{info.summary}</Text>
                  </View>

                  {/* How it Works Bullet Points */}
                  {info.howItWorks && info.howItWorks.length > 0 && (
                    <View style={styles.bulletsSection}>
                      <Text style={styles.sectionHeading}>HOW IT WORKS</Text>
                      {info.howItWorks.map((point, index) => (
                        <View key={index} style={styles.bulletRow}>
                          <CheckCircle2 size={15} color={accent} style={styles.bulletIcon} />
                          <Text style={styles.bulletText}>{point}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Pro Tip / Strategy Note */}
                  {info.tips && (
                    <View style={[styles.tipCard, { borderColor: accent + '30' }]}>
                      <Lightbulb size={16} color="#FBBF24" style={{ marginTop: 2 }} />
                      <Text style={styles.tipText}>
                        <Text style={{ fontWeight: '800', color: '#FBBF24' }}>Tip: </Text>
                        {info.tips}
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Dismiss Button */}
                <TouchableOpacity
                  style={[styles.dismissBtn, { backgroundColor: accent }]}
                  onPress={handleClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dismissBtnText}>Got it!</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  modalCardGradient: {
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    maxHeight: Dimensions.get('window').height * 0.75,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 320,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  summaryBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 21,
  },
  bulletsSection: {
    gap: 10,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#F8FAFC',
    lineHeight: 18,
  },
  dismissBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  dismissBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
