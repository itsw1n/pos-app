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
import { isSupabaseConfigured } from '@/services/supabase';
import { Navigation } from '@/app/navigation/Navigation';
import { appStyles } from './App.styles';

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
    return <View style={appStyles.gate} />;
  }

  return <>{children}</>;
}

export function App(): React.JSX.Element {
  if (!isSupabaseConfigured) {
    return (
      <View style={appStyles.configurationError}>
        <Text style={appStyles.configurationTitle}>App not configured</Text>
        <Text style={appStyles.configurationMessage}>
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
            <Navigation />
            <StatusBar style="auto" />
          </CartProvider>
        </AuthProvider>
      </FontGate>
    </ErrorBoundary>
  );
}
