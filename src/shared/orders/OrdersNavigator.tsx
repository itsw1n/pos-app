import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '@/theme';
import { Orders } from './pages/Orders';
import { VoidTransaction } from './pages/VoidTransaction';

export type OrdersStackParamList = {
  Orders: undefined;
  Void: {
    transactionId: string;
    date: string;
    total: number;
  };
};

const Stack = createStackNavigator<OrdersStackParamList>();

export function OrdersNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{ title: 'Orders', headerShown: false }}
      />
      <Stack.Screen name="Void" component={VoidTransaction} options={{ title: 'Void Transaction' }} />
    </Stack.Navigator>
  );
}