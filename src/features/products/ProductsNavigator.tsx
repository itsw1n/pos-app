import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../../theme';
import { Product } from '../../types/entities';
import { ProductsScreen } from './ProductsScreen';
import { AddEditProductScreen } from './AddEditProductScreen';

export type ProductsStackParamList = {
  Products: undefined;
  AddEditProduct: { product?: Product } | undefined;
};

const Stack = createStackNavigator<ProductsStackParamList>();

export function ProductsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { ...typography.xl, color: colors.textPrimary },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Products', headerShown: false }}
      />
      <Stack.Screen
        name="AddEditProduct"
        component={AddEditProductScreen}
        options={{ title: 'Add Product', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
