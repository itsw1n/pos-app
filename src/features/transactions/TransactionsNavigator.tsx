import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { TransactionHistoryScreen } from './TransactionHistoryScreen';
import { VoidScreen } from './VoidScreen';

export type TransactionsStackParamList = {
  TransactionHistory: undefined;
  Void: {
    transactionId: string;
    date: string;
    total: number;
  };
};

const Stack = createStackNavigator<TransactionsStackParamList>();

export function TransactionsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ title: 'Orders', headerShown: false }}
      />
      <Stack.Screen name="Void" component={VoidScreen} options={{ title: 'Void Transaction' }} />
    </Stack.Navigator>
  );
}
