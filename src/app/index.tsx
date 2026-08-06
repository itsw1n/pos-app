import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary/ErrorBoundary';
import { Navigation } from './navigation';

function FontGate({ children }: { children: React.ReactNode }): React.JSX.Element {
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