import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';

export type LoginStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { code?: string } | undefined;
};

const Stack = createStackNavigator<LoginStackParamList>();

export function LoginNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ title: 'Reset password' }}
      />
    </Stack.Navigator>
  );
}
