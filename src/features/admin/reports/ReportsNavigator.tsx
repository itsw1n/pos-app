import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '@/theme';
import { InventoryManagement } from '@/features/admin/inventory-management/pages/InventoryManagement';
import { StockIn } from '@/features/admin/inventory-management/pages/StockIn';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';

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
        component={Dashboard}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Stack.Screen name="Reports" component={Reports} options={{ title: 'Reports', headerShown: false }} />
      <Stack.Screen name="Inventory" component={InventoryManagement} options={{ title: 'Inventory' }} />
      <Stack.Screen name="StockIn" component={StockIn} options={{ title: 'Stock In' }} />
    </Stack.Navigator>
  );
}