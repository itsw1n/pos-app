import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box, ChartColumn, Receipt, Settings, UtensilsCrossed } from 'lucide-react-native';
import { TabBarIcon } from '@/components/common/TabBarIcon/TabBarIcon';
import { ProductsNavigator } from '@/features/products/ProductsNavigator';
import { TransactionsNavigator } from '@/features/transactions/TransactionsNavigator';
import { ReportsNavigator } from '@/features/reports/ReportsNavigator';
import { SettingsNavigator } from '@/features/settings/SettingsNavigator';
import { colors } from '@/theme';

const Tabs = createBottomTabNavigator();

export function AdminNavigator(): React.JSX.Element {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="Products"
        component={ProductsNavigator}
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
        name="Dashboard"
        component={ReportsNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon icon={ChartColumn} focused={focused} color={color} size={size} />
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