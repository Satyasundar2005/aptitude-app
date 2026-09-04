import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, Sparkles, CheckCircle2, XCircle } from 'lucide-react-native';
import { KojiAvatar } from './KojiAvatar';
import { KojiTutorCard } from './KojiTutorCard';
import { Question } from '../../types/game';
import { generateKojiCorrection, KojiExplanation } from '../../services/kojiTutorService';

interface Props {
  visible: boolean;
  question: Question | null;
  chosenIndex: number | null;
  onClose: () => void;
  overrideExplanation?: KojiExplanation | null;
}

export const KojiTutorModal: React.FC<Props> = ({
  visible,
  question,
  chosenIndex,
  onClose,
  overrideExplanation,
}) => {
  if (!question) return null;

  const validChosenIndex = chosenIndex !== null && chosenIndex !== undefined ? chosenIndex : 0;
  const correction = overrideExplanation || generateKojiCorrection(question, validChosenIndex);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <KojiAvatar size={38} mood="thoughtful" showBadge={false} />
              <View>
                <View style={styles.tutorTag}>
                  <Sparkles size={11} color="#06B6D4" />
                  <Text style={styles.tutorTagText}>KOJI AI TUTOR</Text>
                </View>
                <Text style={styles.headerTitle}>Mistake Breakdown</Text>
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

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* The Question Prompt Box */}
            <View style={styles.questionBox}>
              <View style={styles.qMetaRow}>
                <Text style={styles.qCategory}>
                  {question.category.replace('_', ' ').toUpperCase()}
                </Text>
                {question.examTag && <Text style={styles.qExamTag}>{question.examTag}</Text>}
              </View>
              <Text style={styles.questionText}>{question.text}</Text>

              {/* Options Snapshot */}
              <View style={styles.optionsList}>
                {question.options.map((opt, idx) => {
                  const isCorrect = idx === question.correctIndex;
                  const isPicked = idx === chosenIndex;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.optionRow,
                        isCorrect && styles.optionRowCorrect,
                        isPicked && !isCorrect && styles.optionRowWrong,
                      ]}
                    >
                      <View style={styles.optionLetterBadge}>
                        <Text style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isCorrect && styles.optionTextCorrect,
                          isPicked && !isCorrect && styles.optionTextWrong,
                        ]}
                      >
                        {opt}
                      </Text>
                      {isCorrect && <CheckCircle2 size={16} color="#10B981" />}
                      {isPicked && !isCorrect && <XCircle size={16} color="#EF4444" />}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Koji's In-Depth Tutor Card */}
            <KojiTutorCard
              correction={correction}
              onContinue={onClose}
              continueButtonText="I Understand Now!"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 18, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
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
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  questionBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  qMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qCategory: {
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  optionsList: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionRowCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionRowWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionLetterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetter: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
  },
  optionTextCorrect: {
    color: '#10B981',
    fontWeight: '700',
  },
  optionTextWrong: {
    color: '#F87171',
    fontWeight: '700',
  },
});
