import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react-native';
import { KojiAvatar } from './KojiAvatar';
import { KojiExplanation } from '../../services/kojiTutorService';

interface Props {
  correction: KojiExplanation;
  onContinue?: () => void;
  continueButtonText?: string;
  showContinueButton?: boolean;
}

export const KojiTutorCard: React.FC<Props> = ({
  correction,
  onContinue,
  continueButtonText = 'Got It, Next Question',
  showContinueButton = true,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.cardContainer}>
      {/* Top Banner with Koji Mascot */}
      <View style={styles.headerRow}>
        <KojiAvatar size={48} mood={correction.mood} />
        <View style={styles.headerTextGroup}>
          <View style={styles.tutorTagRow}>
            <Sparkles size={12} color="#06B6D4" />
            <Text style={styles.tutorTagText}>KOJI • YOUR AI APTITUDE TUTOR</Text>
          </View>
          <Text style={styles.greetingText}>{correction.tutorGreeting}</Text>
        </View>
      </View>

      {/* The Mistake / Trap Diagnosis */}
      <View style={styles.trapBox}>
        <View style={styles.boxHeaderRow}>
          <AlertCircle size={16} color="#F43F5E" />
          <Text style={styles.trapTitle}>The Trap In Your Answer</Text>
        </View>
        <Text style={styles.trapBody}>{correction.trapAnalysis}</Text>
      </View>

      {/* Concept Key Pill */}
      <View style={styles.conceptPill}>
        <Text style={styles.conceptLabel}>CORE CONCEPT:</Text>
        <Text style={styles.conceptValue} numberOfLines={1}>
          {correction.conceptKey}
        </Text>
      </View>

      {/* Step-by-Step Toggle Header */}
      <TouchableOpacity
        style={styles.expandHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.expandHeaderLeft}>
          <Lightbulb size={16} color="#F59E0B" />
          <Text style={styles.expandHeaderTitle}>Koji's Step-by-Step Intuition</Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color="#94A3B8" />
        ) : (
          <ChevronDown size={18} color="#94A3B8" />
        )}
      </TouchableOpacity>

      {/* Step-by-Step Walkthrough */}
      {expanded && (
        <View style={styles.stepsContainer}>
          {correction.stepByStep.map((step, idx) => (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/* Correct Answer Highlight */}
          <View style={styles.correctHighlightBox}>
            <Text style={styles.correctLabel}>Correct Answer:</Text>
            <Text style={styles.correctValue}>{correction.correctAnswer}</Text>
          </View>

          {/* Koji Pro Tip */}
          <View style={styles.proTipBox}>
            <Sparkles size={14} color="#8B5CF6" style={{ marginTop: 2 }} />
            <Text style={styles.proTipText}>{correction.proTip}</Text>
          </View>

          {/* Encouragement Footer */}
          <Text style={styles.encouragementText}>"{correction.encouragement}"</Text>
        </View>
      )}

      {/* Action Button */}
      {showContinueButton && onContinue && (
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>{continueButtonText}</Text>
          <ArrowRight size={18} color="#0B0F19" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#131D31',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    marginVertical: 12,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerTextGroup: {
    flex: 1,
  },
  tutorTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  tutorTagText: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  greetingText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  trapBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    marginBottom: 12,
  },
  boxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  trapTitle: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  trapBody: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  conceptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  conceptLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  conceptValue: {
    flex: 1,
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '700',
  },
  expandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  expandHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandHeaderTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  stepsContainer: {
    paddingTop: 8,
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    color: '#0B0F19',
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
  },
  correctHighlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 4,
  },
  correctLabel: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  correctValue: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  proTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    marginTop: 2,
  },
  proTipText: {
    flex: 1,
    color: '#D8B4FE',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  encouragementText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  continueBtnText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
