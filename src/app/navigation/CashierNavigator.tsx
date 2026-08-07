import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box, Receipt, Settings, UtensilsCrossed } from 'lucide-react-native';
import { TabBarIcon } from '@/components/common/TabBarIcon/TabBarIcon';
import { MenuNavigator } from '@/features/cashier/menu/MenuNavigator';
import { OrdersNavigator } from '@/features/shared/orders/OrdersNavigator';
import { Inventory } from '@/features/cashier/inventory/pages/Inventory';
import { SettingsNavigator } from '@/features/shared/settings/SettingsNavigator';
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
        component={MenuNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={UtensilsCrossed} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={Receipt} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Inventory"
        component={Inventory}
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