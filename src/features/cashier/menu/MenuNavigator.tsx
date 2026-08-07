import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '@/theme';
import { PaymentMode, POSTransaction } from '@/types/context';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { Menu } from './pages/Menu';
import { Receipt } from './pages/Receipt';

export type MenuStackParamList = {
  MenuHome: undefined;
  Checkout: undefined;
  Payment: { paymentMode: PaymentMode };
  Receipt: { transaction: POSTransaction };
};

const Stack = createStackNavigator<MenuStackParamList>();

export function MenuNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="MenuHome" component={Menu} options={{ title: 'Menu', headerShown: false }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout', headerShown: false }} />
      <Stack.Screen name="Payment" component={Payment} options={{ title: 'Payment', headerShown: false }} />
      <Stack.Screen name="Receipt" component={Receipt} options={{ title: 'Receipt', headerShown: false }} />
    </Stack.Navigator>
  );
}