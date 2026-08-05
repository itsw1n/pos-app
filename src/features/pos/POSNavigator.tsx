import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { PaymentMode, POSTransaction } from '../../types/context';
import { CartScreen } from './CartScreen';
import { CheckoutScreen } from './CheckoutScreen';
import { PaymentScreen } from './PaymentScreen';
import { POSScreen } from './POSScreen';
import { ReceiptScreen } from './ReceiptScreen';

export type POSStackParamList = {
  POS: undefined;
  Cart: undefined;
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
      <Stack.Screen name="POS" component={POSScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
    </Stack.Navigator>
  );
}
