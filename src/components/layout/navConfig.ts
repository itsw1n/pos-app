import { ComponentType } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { InventoryNavigator } from '../../features/inventory/InventoryNavigator';
import { InventoryViewScreen } from '../../features/inventory/InventoryViewScreen';
import { POSNavigator } from '../../features/pos/POSNavigator';
import { ReportsNavigator } from '../../features/reports/ReportsNavigator';
import { SettingsNavigator } from '../../features/settings/SettingsNavigator';
import { TransactionsNavigator } from '../../features/transactions/TransactionsNavigator';
import { UserRole } from '../../types/entities';

export interface NavTab {
  name: string;
  component: ComponentType<object>;
  icon: keyof (typeof Ionicons)['glyphMap'];
  headerShown?: boolean;
}

export const navConfig: Record<UserRole, readonly NavTab[]> = {
  cashier: [
    { name: 'Menu', component: POSNavigator, icon: 'restaurant' },
    { name: 'Orders', component: TransactionsNavigator, icon: 'receipt' },
    { name: 'Inventory', component: InventoryViewScreen, icon: 'cube', headerShown: true },
    { name: 'Settings', component: SettingsNavigator, icon: 'settings' },
  ],
  admin: [
    { name: 'Menu', component: POSNavigator, icon: 'restaurant' },
    { name: 'Orders', component: TransactionsNavigator, icon: 'receipt' },
    { name: 'Inventory', component: InventoryNavigator, icon: 'cube' },
    { name: 'Dashboard', component: ReportsNavigator, icon: 'stats-chart' },
    { name: 'Settings', component: SettingsNavigator, icon: 'settings' },
  ],
};