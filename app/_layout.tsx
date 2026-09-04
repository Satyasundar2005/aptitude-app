import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useUserStore } from '../src/store/useUserStore';

export default function RootLayout() {
  useEffect(() => {
    // Restore existing Supabase session and user profile
    useUserStore.getState().initAuth();
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a1a2e' },
          animation: 'fade',
        }}
      />
    </ErrorBoundary>
  );
}
