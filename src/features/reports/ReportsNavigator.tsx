import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { InventoryScreen } from '../inventory/InventoryScreen';
import { StockInScreen } from '../inventory/StockInScreen';
import { DashboardScreen } from './DashboardScreen';
import { ReportsScreen } from './ReportsScreen';

export type ReportsStackParamList = {
  Dashboard: undefined;
  Reports: undefined;
  Inventory: undefined;
  StockIn: {
    stockId: number;
    productName: string;
    currentQuantity: number;
    reorderLevel: number;
  };
};

const Stack = createStackNavigator<ReportsStackParamList>();

export function ReportsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports', headerShown: false }} />
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <Stack.Screen name="StockIn" component={StockInScreen} options={{ title: 'Stock In' }} />
    </Stack.Navigator>
  );
}
