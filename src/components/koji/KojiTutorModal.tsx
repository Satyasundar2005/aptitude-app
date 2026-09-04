import React from 'react';
import { Question } from '../../types/game';
import { KojiExplanation } from '../../services/kojiTutorService';
import { MistakeItem } from '../../services/kojiChatService';
import { KojiInteractiveModal } from './KojiInteractiveModal';

export interface KojiTutorModalProps {
  visible: boolean;
  question?: Question | null;
  chosenIndex?: number | null;
  mistakes?: MistakeItem[];
  initialIndex?: number;
  onClose: () => void;
  overrideExplanation?: KojiExplanation | null;
}

/**
 * Universal Koji Tutor Modal with Interactive Doubt Solver, Concept Simplification,
 * and Multi-Mistake Navigation Stepper.
 */
export const KojiTutorModal: React.FC<KojiTutorModalProps> = ({
  visible,
  question,
  chosenIndex,
  mistakes,
  initialIndex = 0,
  onClose,
}) => {
  return (
    <KojiInteractiveModal
      visible={visible}
      question={question}
      chosenIndex={chosenIndex}
      mistakes={mistakes}
      initialIndex={initialIndex}
      onClose={onClose}
    />
  );
};
