import React from 'react';
import { useRouter } from 'expo-router';
import HomeScreen from '../src/screens/HomeScreen';

type Screen = 'home' | 'difficulty' | 'duel' | 'solo' | 'practice' | 'online';

export default function IndexScreen() {
  const router = useRouter();

  const handleNavigate = (screen: Screen) => {
    if (screen === 'duel') {
      router.push('/duel');
    } else if (screen === 'solo') {
      router.push('/solo');
    } else if (screen === 'practice') {
      router.push('/practice');
    } else if (screen === 'online') {
      router.push('/online');
    }
  };

  return <HomeScreen onNavigate={handleNavigate} />;
}
