import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';
import { KojiMood } from '../../services/kojiTutorService';

interface Props {
  size?: number;
  mood?: KojiMood;
  showBadge?: boolean;
}

export const KojiAvatar: React.FC<Props> = ({
  size = 56,
  mood = 'encouraging',
  showBadge = true,
}) => {
  const scale = size / 56;

  // Eye and expression configurations based on mood
  const eyeColor =
    mood === 'celebrating' ? '#10B981' : mood === 'thoughtful' ? '#F59E0B' : '#06B6D4';

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 56 56">
        {/* Outer Glow Halo */}
        <Circle cx="28" cy="28" r="26" fill="rgba(6, 182, 212, 0.12)" />
        <Circle cx="28" cy="28" r="23" fill="#111827" stroke="#06B6D4" strokeWidth="2" />

        {/* Cyber Antennas / Ears */}
        <Rect x="14" y="8" width="4" height="6" rx="2" fill="#8B5CF6" />
        <Rect x="38" y="8" width="4" height="6" rx="2" fill="#8B5CF6" />

        {/* Head Shell */}
        <Rect
          x="12"
          y="14"
          width="32"
          height="28"
          rx="8"
          fill="#1E293B"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Screen / Visor */}
        <Rect x="15" y="17" width="26" height="15" rx="5" fill="#0B0F19" />

        {/* Tutor Glasses Rim Accent */}
        <Path
          d="M17 21 C17 19, 25 19, 25 21 M31 21 C31 19, 39 19, 39 21 M25 21 L31 21"
          stroke="#F59E0B"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes based on mood */}
        {mood === 'celebrating' ? (
          <G>
            {/* Happy arch eyes ^ ^ */}
            <Path
              d="M19 25 Q21 21 23 25"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M33 25 Q35 21 37 25"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        ) : mood === 'thoughtful' ? (
          <G>
            {/* Thinking raised brow */}
            <Circle cx="21" cy="24" r="2.5" fill={eyeColor} />
            <Circle cx="35" cy="24" r="2.5" fill={eyeColor} />
            <Path d="M18 20 L24 21" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <Path d="M32 21 L38 19" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          </G>
        ) : (
          <G>
            {/* Friendly bright eyes with shine */}
            <Circle cx="21" cy="24" r="3" fill={eyeColor} />
            <Circle cx="22" cy="23" r="1" fill="#FFFFFF" />
            <Circle cx="35" cy="24" r="3" fill={eyeColor} />
            <Circle cx="36" cy="23" r="1" fill="#FFFFFF" />
          </G>
        )}

        {/* Warm Tutor Smile */}
        <Path
          d="M24 35 Q28 38 32 35"
          stroke="#06B6D4"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cheeks blush */}
        <Circle cx="16" cy="28" r="1.5" fill="rgba(244, 63, 94, 0.4)" />
        <Circle cx="40" cy="28" r="1.5" fill="rgba(244, 63, 94, 0.4)" />
      </Svg>

      {/* Mini AI Badge Indicator */}
      {showBadge && (
        <View style={[styles.aiBadge, { transform: [{ scale }] }]}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#0B0F19',
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
