import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box, Receipt, Settings, UtensilsCrossed } from 'lucide-react-native';
import { TabBarIcon } from '@/components/common/TabBarIcon/TabBarIcon';
import { POSNavigator } from '@/features/pos/POSNavigator';
import { TransactionsNavigator } from '@/features/transactions/TransactionsNavigator';
import { InventoryViewScreen } from '@/features/inventory/InventoryViewScreen';
import { SettingsNavigator } from '@/features/settings/SettingsNavigator';
import { colors } from '@/theme';

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
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={UtensilsCrossed} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Orders"
        component={TransactionsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={Receipt} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Inventory"
        component={InventoryViewScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={Box} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={Settings} focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}