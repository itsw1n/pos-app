import React from 'react';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { ProductsNavigator, ProductsStackParamList } from '../products/ProductsNavigator';
import { SettingsScreen } from './SettingsScreen';
import { PrinterSettings } from './PrinterSettings';
import { UserManagement } from './UserManagement';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Products: NavigatorScreenParams<ProductsStackParamList> | undefined;
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
        component={SettingsScreen}
        options={{ title: 'Settings', headerShown: false }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsNavigator}
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
