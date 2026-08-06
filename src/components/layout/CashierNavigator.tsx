import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box, Receipt, Settings, UtensilsCrossed } from 'lucide-react-native';
import { POSNavigator } from '../../features/pos/POSNavigator';
import { TransactionsNavigator } from '../../features/transactions/TransactionsNavigator';
import { InventoryViewScreen } from '../../features/inventory/InventoryViewScreen';
import { SettingsNavigator } from '../../features/settings/SettingsNavigator';
import { colors } from '../../theme';

const Tabs = createBottomTabNavigator();

export function CashierNavigator(): React.JSX.Element {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="Menu"
        component={POSNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Orders"
        component={TransactionsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Inventory"
        component={InventoryViewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Box color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}