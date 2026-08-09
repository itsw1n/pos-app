import React from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary/ErrorBoundary';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { isSupabaseConfigured } from '@/services/supabase';
import { Navigation } from '@/app/navigation/Navigation';

function OfflineSyncGate(): null {
  useOfflineSync();
  return null;
}

function FontGate({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F5F5F5' }} />;
  }

  return <>{children}</>;
}

export function App(): React.JSX.Element {
  if (!isSupabaseConfigured) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#F5F5F5',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A' }}>
          App not configured
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            color: '#6B6B6B',
            textAlign: 'center',
          }}
        >
          Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.
          Rebuild with the correct .env file.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <FontGate>
        <AuthProvider>
          <CartProvider>
            <OfflineSyncGate />
            <Navigation />
            <StatusBar style="auto" />
          </CartProvider>
        </AuthProvider>
      </FontGate>
    </ErrorBoundary>
  );
}
