import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types/entities';
import { colors } from '../../theme';
import { navConfig } from './navConfig';

const Tabs = createBottomTabNavigator();

type NavBarProps = {
  role: UserRole;
};

export function NavBar({ role }: NavBarProps): React.JSX.Element {
  const tabs = navConfig[role];

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            headerShown: tab.headerShown ?? false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs.Navigator>
  );
}
