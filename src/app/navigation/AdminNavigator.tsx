import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box, ChartColumn, Receipt, Settings, UtensilsCrossed } from 'lucide-react-native';
import { TabBarIcon } from '@/components/common/TabBarIcon/TabBarIcon';
import { MenuManagementNavigator } from '@/admin/menu-management/MenuManagementNavigator';
import { OrdersNavigator } from '@/shared/orders/OrdersNavigator';
import { ReportsNavigator } from '@/admin/reports/ReportsNavigator';
import { SettingsNavigator } from '@/shared/settings/SettingsNavigator';
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
        component={MenuManagementNavigator}
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