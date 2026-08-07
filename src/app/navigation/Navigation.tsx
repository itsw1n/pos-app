import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { AdminNavigator } from '@/app/navigation/AdminNavigator';
import { CashierNavigator } from '@/app/navigation/CashierNavigator';
import { LoginScreen } from '@/shared/login/pages/Login';
import { colors } from '@/theme';

const Stack = createStackNavigator();

const loadingStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  surface: {
    flex: 1,
  },
});

function LoadingScreen(): React.JSX.Element {
  return (
    <View style={loadingStyles.surface}>
      <View style={loadingStyles.screen}>
        <ActivityIndicator color={colors.primary} />
      </View>
    </View>
  );
}

export function Navigation(): React.JSX.Element {
  const { user, role, isHydrating } = useAuth();

  if (isHydrating) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {() => (role === 'admin' ? <AdminNavigator /> : <CashierNavigator />)}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}