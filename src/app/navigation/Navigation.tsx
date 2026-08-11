import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useConnectivity } from '@/hooks/useConnectivity';
import { OfflineBanner } from '@/components/common/OfflineBanner/OfflineBanner';
import { AdminNavigator } from '@/app/navigation/AdminNavigator';
import { CashierNavigator } from '@/app/navigation/CashierNavigator';
import { LoginScreen } from '@/features/shared/login/pages/Login';
import { colors } from '@/theme';
import { loadingStyles, navigationStyles } from './Navigation.styles';

const Stack = createStackNavigator();

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
  const isConnected = useConnectivity();

  if (isHydrating) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <View style={navigationStyles.root}>
        <OfflineBanner visible={!isConnected} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }

  return (
    <View style={navigationStyles.root}>
      <OfflineBanner visible={!isConnected} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main">
            {() =>
              role === 'admin' ? <AdminNavigator /> : <CashierNavigator />
            }
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
