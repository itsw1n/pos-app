import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '@/theme';
import { Product } from '@/types/entities';
import { MenuManagement } from './pages/MenuManagement';
import { AddEditMenuItem } from './pages/AddEditMenuItem';

export type MenuManagementStackParamList = {
  MenuManagement: undefined;
  AddEditMenuItem: { product?: Product } | undefined;
};

const Stack = createStackNavigator<MenuManagementStackParamList>();

export function MenuManagementNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="MenuManagement"
        component={MenuManagement}
        options={{ title: 'Menu Management', headerShown: false }}
      />
      <Stack.Screen
        name="AddEditMenuItem"
        component={AddEditMenuItem}
        options={{ title: 'Add Menu Item', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
