import React from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import DuelScreen from '../src/screens/DuelScreen';
import { useGameStore } from '../src/store/useGameStore';

export default function DuelRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetGame } = useGameStore();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetGame();
    router.back();
  };

  return (
    <View style={styles.container}>
      <DuelScreen />
      <TouchableOpacity
        style={[styles.closeButton, { top: Math.max(insets.top + 8, 44) }]}
        onPress={handleClose}
        activeOpacity={0.75}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <X size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
