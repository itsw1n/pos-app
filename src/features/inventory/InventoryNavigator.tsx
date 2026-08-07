import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { InventoryScreen } from './InventoryScreen';
import { StockInScreen } from './StockInScreen';

export type InventoryStackParamList = {
  InventoryList: undefined;
  StockIn: {
    stockId: number;
    productName: string;
    currentQuantity: number;
    reorderLevel: number;
  };
};

const Stack = createStackNavigator<InventoryStackParamList>();

export function InventoryNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="InventoryList"
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen name="StockIn" component={StockInScreen} options={{ title: 'Stock In' }} />
    </Stack.Navigator>
  );
}
