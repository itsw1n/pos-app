import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { NavBar } from '../components/layout/NavBar';
import { LoginScreen } from '../features/auth/LoginScreen';

const Stack = createStackNavigator();

export function Navigation(): React.JSX.Element {
  const { user, role } = useAuth();

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
        <Stack.Screen name="Main">{() => <NavBar role={role ?? 'cashier'} />}</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}