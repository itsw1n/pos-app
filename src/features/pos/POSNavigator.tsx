import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { PaymentMode, POSTransaction } from '../../types/context';
import { CheckoutScreen } from './CheckoutScreen';
import { PaymentScreen } from './PaymentScreen';
import { POSScreen } from './POSScreen';
import { ReceiptScreen } from './ReceiptScreen';

export type POSStackParamList = {
  POS: undefined;
  Checkout: undefined;
  Payment: { paymentMode: PaymentMode };
  Receipt: { transaction: POSTransaction };
};

const Stack = createStackNavigator<POSStackParamList>();

export function POSNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="POS" component={POSScreen} options={{ title: 'Menu', headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout', headerShown: false }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment', headerShown: false }} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt', headerShown: false }} />
    </Stack.Navigator>
  );
}
