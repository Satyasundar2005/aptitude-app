import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const InfoButton: React.FC<Props> = ({
  onPress,
  size = 14,
  color = '#38BDF8',
  style,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.infoBtn, { borderColor: color + '40' }, style]}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
      accessibilityLabel="Feature Information"
    >
      <Info size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  infoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
