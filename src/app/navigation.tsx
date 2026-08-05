import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../features/auth/LoginScreen';
import { InventoryNavigator } from '../features/inventory/InventoryNavigator';
import { InventoryViewScreen } from '../features/inventory/InventoryViewScreen';
import { POSNavigator } from '../features/pos/POSNavigator';
import { ReportsNavigator } from '../features/reports/ReportsNavigator';
import { SettingsNavigator } from '../features/settings/SettingsNavigator';
import { TransactionsNavigator } from '../features/transactions/TransactionsNavigator';
import { colors } from '../theme';
import { navigationStyles } from './navigation.styles';

const Stack = createStackNavigator();
const CashierTabs = createBottomTabNavigator();
const AdminTabs = createBottomTabNavigator();

const tabScreenOptions = {
  headerShown: true,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
};

function CashierNavigator(): React.JSX.Element {
  return (
    <CashierTabs.Navigator screenOptions={tabScreenOptions}>
      <CashierTabs.Screen
        name="Menu"
        component={POSNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" color={color} size={size} />,
        }}
      />
      <CashierTabs.Screen
        name="Orders"
        component={TransactionsNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" color={color} size={size} />,
        }}
      />
      <CashierTabs.Screen
        name="Inventory"
        component={InventoryViewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" color={color} size={size} />,
        }}
      />
      <CashierTabs.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </CashierTabs.Navigator>
  );
}

function AdminNavigator(): React.JSX.Element {
  return (
    <AdminTabs.Navigator screenOptions={tabScreenOptions}>
      <AdminTabs.Screen
        name="Menu"
        component={POSNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" color={color} size={size} />,
        }}
      />
      <AdminTabs.Screen
        name="Orders"
        component={TransactionsNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" color={color} size={size} />,
        }}
      />
      <AdminTabs.Screen
        name="Inventory"
        component={InventoryNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" color={color} size={size} />,
        }}
      />
      <AdminTabs.Screen
        name="Dashboard"
        component={ReportsNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <AdminTabs.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </AdminTabs.Navigator>
  );
}

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
        <Stack.Screen name="Main">
          {() => (role === 'admin' ? <AdminNavigator /> : <CashierNavigator />)}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
