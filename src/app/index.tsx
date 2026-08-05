import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Navigation } from './navigation';

export function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <CartProvider>
        <Navigation />
        <StatusBar style="auto" />
      </CartProvider>
    </AuthProvider>
  );
}
