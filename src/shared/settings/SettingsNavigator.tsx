import React from 'react';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '@/theme';
import { MenuManagementNavigator, MenuManagementStackParamList } from '@/admin/menu-management/MenuManagementNavigator';
import { Settings } from './pages/Settings';
import { PrinterSettings } from './pages/PrinterSettings';
import { UserManagement } from './pages/UserManagement';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  MenuManagement: NavigatorScreenParams<MenuManagementStackParamList> | undefined;
  PrinterSettings: undefined;
  UserManagement: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export function SettingsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={Settings}
        options={{ title: 'Settings', headerShown: false }}
      />
      <Stack.Screen
        name="MenuManagement"
        component={MenuManagementNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrinterSettings"
        component={PrinterSettings}
        options={{ title: 'Printer Settings' }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagement}
        options={{ title: 'User Management' }}
      />
    </Stack.Navigator>
  );
}
