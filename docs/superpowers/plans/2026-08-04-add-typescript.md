# Add TypeScript to IPSS Expo Project

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full TypeScript support to the IPSS Expo project — types for all 6 entities, typed hooks/services/context, and strict tsconfig.

**Architecture:** Expo project initialized with TypeScript template. All JSX files converted to TSX. Type definitions mirror the 6 ERD entities from the system documentation. Hooks encapsulate all business logic; screens are pure UI components importing from hooks and services.

**Tech Stack:** React Native + Expo (TypeScript template), Supabase, expo-sqlite, @react-navigation, @react-native-community/netinfo, react-native-uuid, Victory Native, expo-print, expo-sharing

## Global Constraints

- Platform: Mobile-based application (Expo Go + APK build)
- Database: Supabase (online) + SQLite via expo-sqlite (offline)
- Auth: Supabase Auth with role-based access (admin | cashier)
- Offline sync: UUID-based transaction IDs prevent duplicates on push
- All passwords stored hashed (Supabase handles this)
- Data Privacy Act of 2012 compliance — no PII in logs
- Color palette must match Cafe Elvira branding (see IPSS_CodingGuide.jsx constants)
- ~25 products max, single branch

---

## Task 1: Initialize Expo TypeScript Project

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `App.tsx`

**Interfaces:**
- Produces: Working Expo + TypeScript project that compiles with `npx expo start`

- [ ] **Step 1: Initialize Expo with TypeScript template**

```bash
npx create-expo-app . --template blank-typescript
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors (or only expected missing-module errors from uninstalled deps).

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: initialize Expo TypeScript project"
```

---

## Task 2: Install All Dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: All dependencies installed and importable

- [ ] **Step 1: Install navigation dependencies**

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

- [ ] **Step 2: Install Supabase and offline dependencies**

```bash
npm install @supabase/supabase-js
npx expo install expo-sqlite
npm install @react-native-community/netinfo
npm install react-native-uuid
```

- [ ] **Step 3: Install receipt/printing dependencies**

```bash
npx expo install expo-print expo-sharing
```

- [ ] **Step 4: Install charting dependency**

```bash
npm install victory-native
npx expo install react-native-svg
```

- [ ] **Step 5: Install type definitions**

```bash
npm install -D @types/react @types/react-native
```

- [ ] **Step 6: Verify install**

```bash
npx tsc --noEmit
```

Expected: Compiles without type errors (may have unused import warnings).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json
git commit -m "feat: install all dependencies with TypeScript types"
```

---

## Task 3: Create Entity Type Definitions

**Files:**
- Create: `src/types/entities.ts`

**Interfaces:**
- Consumes: None (standalone type file)
- Produces: All 6 entity interfaces used by every other task

- [ ] **Step 1: Create the entities type file** matching the ERD from the system documentation

```typescript
export type UserRole = 'admin' | 'cashier';

export interface User {
  user_id: number;
  username: string;
  password: string;
  role: UserRole;
}

export interface Product {
  product_id: number;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
}

export interface Transaction {
  transaction_id: number;
  date: string;
  total_amount: number;
  payment_mode: 'cash' | 'gcash' | 'maya';
  user_id: number;
}

export interface TransactionItem {
  item_id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  subtotal: number;
}

export interface Inventory {
  stock_id: number;
  product_id: number;
  quantity: number;
  reorder_level: number;
}

export interface StockMovement {
  movement_id: number;
  stock_id: number;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  supplier?: string;
}
```

- [ ] **Step 2: Create a union type for all entity names**

```typescript
export type EntityName = 'user' | 'product' | 'transaction' | 'transaction_item' | 'inventory' | 'stock_movement';
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/entities.ts
git commit -m "feat: add TypeScript entity type definitions"
```

---

## Task 4: Create Constants and Context Types

**Files:**
- Create: `src/constants/colors.ts`
- Create: `src/constants/roles.ts`
- Create: `src/types/context.ts`

**Interfaces:**
- Consumes: `UserRole` from `src/types/entities.ts`
- Produces: Color constants, role constants, and context type interfaces used by all screens

- [ ] **Step 1: Create colors.ts** from the coding guide palette

```typescript
export const Colors = {
  primary: '#364C35',
  secondary: '#4D644B',
  navActive: '#ADC5AB',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  success: '#4CAF72',
  warning: '#F5A623',
  danger: '#E8614A',
  disabled: '#C2C5C5',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  border: '#E0E0E0',
} as const;

export type ColorName = keyof typeof Colors;
```

- [ ] **Step 2: Create roles.ts**

```typescript
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
```

- [ ] **Step 3: Create context types**

```typescript
import { User, UserRole } from '../types/entities';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { product_id: number; name: string; price: number }) => void;
  removeFromCart: (productId: number) => void;
  getTotal: () => number;
  clearCart: () => void;
}
```

- [ ] **Step 4: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/constants/ src/types/context.ts
git commit -m "feat: add constants and context type definitions"
```

---

## Task 5: Create Service Layer Types and Skeletons

**Files:**
- Create: `src/services/supabase.ts`
- Create: `src/services/sqlite.ts`
- Create: `src/services/syncService.ts`
- Create: `src/services/receiptService.ts`
- Create: `src/services/printerService.ts`

**Interfaces:**
- Consumes: Entity types from `src/types/entities.ts`, `Colors` from `src/constants/colors.ts`
- Produces: Typed service modules that all feature hooks import from

- [ ] **Step 1: Create supabase.ts client**

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
);
```

- [ ] **Step 2: Create sqlite.ts** with typed helper functions

```typescript
import * as SQLite from 'expo-sqlite';
import { Transaction, TransactionItem, Inventory, StockMovement } from '../types/entities';

const db = SQLite.openDatabase('ipss.db');

export function initDb(): void {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        total_amount REAL NOT NULL,
        payment_mode TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transaction_items (
        id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS inventory (
        stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        reorder_level INTEGER NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS stock_movements (
        movement_id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date TEXT NOT NULL,
        supplier TEXT
      );`
    );
  });
}

export function saveToSQLite<T>(table: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const keys = Object.keys(data) as (keyof T)[];
      const values = keys.map((k) => (data[k] as unknown) as string | number);
      const placeholders = keys.map(() => '?').join(', ');
      tx.executeSql(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
        values,
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export function getUnsyncedRecords(table: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${table} WHERE synced = 0`,
        [],
        (_, { rows }) => resolve(rows._array as T[]),
        (_, error) => reject(error)
      );
    });
  });
}

export function markSynced(table: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE ${table} SET synced = 1 WHERE id = ?`,
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}
```

- [ ] **Step 3: Create syncService.ts**

```typescript
import { supabase } from './supabase';
import { getUnsyncedRecords, markSynced, saveToSQLite } from './sqlite';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';

export async function syncPendingRecords(): Promise<void> {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) return;

  const unsynced = await getUnsyncedRecords('transactions');
  for (const record of unsynced) {
    const { error } = await supabase.from('transaction').insert(record);
    if (!error) {
      await markSynced('transactions', record.id);
    }
  }
}
```

- [ ] **Step 4: Create receiptService.ts**

```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateReceipt(transaction: {
  transaction_id: string;
  total_amount: number;
  payment_mode: string;
  date: string;
  items: Array<{ name: string; quantity: number; subtotal: number }>;
}): Promise<string> {
  const html = `
    <html><body style="font-family: monospace; padding: 20px;">
      <h3>IPSS - Cafe Elvira</h3>
      <p>Transaction: ${transaction.transaction_id}</p>
      <p>Date: ${transaction.date}</p>
      <p>Payment: ${transaction.payment_mode}</p>
      <hr />
      ${transaction.items.map(i => `<p>${i.name} x${i.quantity} = ${i.subtotal}</p>`).join('')}
      <hr />
      <p><strong>Total: ${transaction.total_amount}</strong></p>
    </body></html>
  `;
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function shareReceipt(uri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri);
}
```

- [ ] **Step 5: Create printerService.ts**

```typescript
import * as Print from 'expo-print';

export async function printReceipt(html: string): Promise<void> {
  await Print.printAsync({ html });
}
```

- [ ] **Step 6: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/services/
git commit -m "feat: add typed service layer skeletons"
```

---

## Task 6: Create Auth Context and Hook

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/features/auth/useAuth.ts`
- Create: `src/features/auth/LoginScreen.tsx`

**Interfaces:**
- Consumes: `AuthContextType` from `src/types/context.ts`, `User` from `src/types/entities.ts`, `supabase` from `src/services/supabase.ts`
- Produces: Global auth state, login/logout functions, role-based navigation

- [ ] **Step 1: Create AuthContext.tsx**

```typescript
import React, { createContext, useContext, useState } from 'react';
import { AuthContextType } from '../../types/context';
import { supabase } from '../../services/supabase';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [role, setRole] = useState<AuthContextType['role']>(null);

  const login = async (username: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) throw error;
    const { data: profile } = await supabase
      .from('user')
      .select('role')
      .eq('user_id', data.user.id)
      .single();
    setUser(data.user);
    setRole(profile?.role ?? 'cashier');
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

- [ ] **Step 2: Create LoginScreen.tsx**

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

export default function LoginScreen(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    try {
      setError('');
      await login(username, password);
    } catch (e) {
      setError('Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IPSS - Cafe Elvira</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center', color: Colors.textPrimary },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: Colors.surface },
  error: { color: Colors.danger, marginBottom: 12, textAlign: 'center' },
});
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/context/ src/features/auth/
git commit -m "feat: add AuthContext, useAuth hook, and LoginScreen"
```

---

## Task 7: Create Navigation Shell

**Files:**
- Create: `src/app/navigation.tsx`
- Create: `src/app/index.tsx`

**Interfaces:**
- Consumes: `AuthProvider` from `src/context/AuthContext.tsx`, role constants
- Produces: Root navigation with role-based tab navigators (cashier vs admin)

- [ ] **Step 1: Create navigation.tsx**

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../features/auth/LoginScreen';

const Stack = createStackNavigator();
const CashierTabs = createBottomTabNavigator();
const AdminTabs = createBottomTabNavigator();

function CashierNavigator(): React.JSX.Element {
  return (
    <CashierTabs.Navigator>
      <CashierTabs.Screen name="Menu" component={/* POS Screen */} />
      <CashierTabs.Screen name="Orders" component={/* Orders Screen */} />
      <CashierTabs.Screen name="Inventory" component={/* Inventory View Screen */} />
      <CashierTabs.Screen name="Settings" component={/* Settings Screen */} />
    </CashierTabs.Navigator>
  );
}

function AdminNavigator(): React.JSX.Element {
  return (
    <AdminTabs.Navigator>
      <AdminTabs.Screen name="Menu" component={/* POS Screen */} />
      <AdminTabs.Screen name="Orders" component={/* Orders Screen */} />
      <AdminTabs.Screen name="Dashboard" component={/* Dashboard Screen */} />
      <AdminTabs.Screen name="Settings" component={/* Settings Screen */} />
    </AdminTabs.Navigator>
  );
}

export default function Navigation(): React.JSX.Element {
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
          {role === 'admin' ? AdminNavigator : CashierNavigator}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 2: Create index.tsx entry point**

```typescript
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Navigation from './app/navigation';

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/
git commit -m "feat: add navigation shell with role-based routing"
```

---

## Task 8: Create POS Feature (Hook + Screens)

**Files:**
- Create: `src/features/pos/usePOS.ts`
- Create: `src/features/pos/POSScreen.tsx`
- Create: `src/features/pos/CartScreen.tsx`
- Create: `src/features/pos/CheckoutScreen.tsx`
- Create: `src/features/pos/PaymentScreen.tsx`
- Create: `src/features/pos/ReceiptScreen.tsx`

**Interfaces:**
- Consumes: `CartContextType` from `src/types/context.ts`, `supabase` and `saveToSQLite` from services, `Colors` from constants
- Produces: Full POS workflow — add to cart, checkout, payment, receipt, inventory deduction

- [ ] **Step 1: Create usePOS.ts** (typed version of the coding guide pattern)

```typescript
import { useState, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { saveToSQLite } from '../../services/sqlite';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import { CartItem } from '../../types/context';

export function usePOS() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: { product_id: number; name: string; price: number }): void => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product_id === product.product_id);
      if (exists) {
        return prev.map((i) => (i.product_id === product.product_id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number): void => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const getTotal = useCallback((): number => {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }, [cart]);

  const processTransaction = useCallback(async (paymentMode: 'cash' | 'gcash' | 'maya', amountReceived?: number): Promise<unknown> => {
    const total = getTotal();
    const transaction = {
      id: uuid.v4(),
      total_amount: total,
      payment_mode: paymentMode,
      amount_received: amountReceived ?? null,
      change_given: paymentMode === 'cash' && amountReceived ? amountReceived - total : null,
      status: 'completed',
      items: cart,
      synced: false,
    };
    const { isConnected } = await NetInfo.fetch();
    if (isConnected) {
      const { error } = await supabase.from('transaction').insert(transaction);
      if (error) throw error;
    } else {
      await saveToSQLite('transactions', transaction);
    }
    setCart([]);
    return transaction;
  }, [cart, getTotal]);

  return { cart, addToCart, removeFromCart, getTotal, processTransaction };
}
```

- [ ] **Step 2: Create POSScreen.tsx** — menu grid with category tabs, product cards, add-to-cart
- [ ] **Step 3: Create CartScreen.tsx** — shows cart items, quantity controls, total
- [ ] **Step 4: Create CheckoutScreen.tsx** — payment mode selection, change computation
- [ ] **Step 5: Create PaymentScreen.tsx** — handles cash/GCash/Maya payment input
- [ ] **Step 6: Create ReceiptScreen.tsx** — displays receipt, print/share options
- [ ] **Step 7: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/features/pos/
git commit -m "feat: add POS feature with typed hooks and screens"
```

---

## Task 9: Create Inventory Feature

**Files:**
- Create: `src/features/inventory/InventoryScreen.tsx`
- Create: `src/features/inventory/InventoryViewScreen.tsx`
- Create: `src/features/inventory/StockInScreen.tsx`
- Create: `src/features/inventory/useInventory.ts`

**Interfaces:**
- Consumes: `Product`, `Inventory`, `StockMovement` from `src/types/entities.ts`, `supabase` and `saveToSQLite` from services, `Colors` from constants
- Produces: Full inventory management — stock tracking, low-stock alerts, stock-in/stock-out

- [ ] **Step 1: Create useInventory.ts** with typed CRUD operations
- [ ] **Step 2: Create InventoryScreen.tsx** — admin full view with stock levels and color badges
- [ ] **Step 3: Create InventoryViewScreen.tsx** — cashier read-only view
- [ ] **Step 4: Create StockInScreen.tsx** — form to add stock with supplier name
- [ ] **Step 5: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/features/inventory/
git commit -m "feat: add inventory feature with typed hooks and screens"
```

---

## Task 10: Create Reports and Dashboard Features

**Files:**
- Create: `src/features/reports/ReportsScreen.tsx`
- Create: `src/features/reports/DashboardScreen.tsx`
- Create: `src/features/reports/useReports.ts`
- Create: `src/features/transactions/TransactionHistoryScreen.tsx`
- Create: `src/features/transactions/VoidScreen.tsx`
- Create: `src/features/transactions/useTransactions.ts`

**Interfaces:**
- Consumes: `Transaction`, `TransactionItem`, `Product`, `Inventory` from entity types, `supabase` from services, `Colors` from constants, `Victory` from victory-native
- Produces: Sales/inventory reports, dashboard analytics, transaction history with void capability

- [ ] **Step 1: Create useReports.ts** with typed report generation functions
- [ ] **Step 2: Create DashboardScreen.tsx** — revenue, total orders, weekly bar chart, low-stock, top products
- [ ] **Step 3: Create ReportsScreen.tsx** — daily/weekly/monthly sales and inventory reports
- [ ] **Step 4: Create useTransactions.ts** with typed transaction history and void functions
- [ ] **Step 5: Create TransactionHistoryScreen.tsx** — list of transactions with void option
- [ ] **Step 6: Create VoidScreen.tsx** — confirmation dialog with required reason
- [ ] **Step 7: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/features/reports/ src/features/transactions/
git commit -m "feat: add reports, dashboard, and transaction history features"
```

---

## Task 11: Create Shared Components

**Files:**
- Create: `src/components/Button.tsx`
- Create: `src/components/ProductCard.tsx`
- Create: `src/components/StockBadge.tsx`
- Create: `src/components/ReceiptView.tsx`

**Interfaces:**
- Consumes: `Colors` from `src/constants/colors.ts`, `Product` from entity types, `Inventory` from entity types
- Produces: Reusable typed UI components used across all screens

- [ ] **Step 1: Create Button.tsx** — typed button component with variant props
- [ ] **Step 2: Create ProductCard.tsx** — displays product name, price, availability
- [ ] **Step 3: Create StockBadge.tsx** — green/yellow/red badge based on inventory level vs reorder threshold
- [ ] **Step 4: Create ReceiptView.tsx** — renders receipt content for print/share
- [ ] **Step 5: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add shared typed UI components"
```

---

## Task 12: Create Product Management and Settings Features

**Files:**
- Create: `src/features/products/ProductsScreen.tsx`
- Create: `src/features/products/AddEditProductScreen.tsx`
- Create: `src/features/products/useProducts.ts`
- Create: `src/features/settings/SettingsScreen.tsx`
- Create: `src/features/settings/PrinterSettings.tsx`
- Create: `src/features/settings/UserManagement.tsx`

**Interfaces:**
- Consumes: `Product` from entity types, `supabase` from services, `Colors` from constants
- Produces: Admin product CRUD, settings screen, printer pairing, user management

- [ ] **Step 1: Create useProducts.ts** with typed CRUD for products
- [ ] **Step 2: Create ProductsScreen.tsx** — list of products with edit/delete
- [ ] **Step 3: Create AddEditProductScreen.tsx** — form for adding/editing products
- [ ] **Step 4: Create SettingsScreen.tsx** — settings entry point
- [ ] **Step 5: Create PrinterSettings.tsx** — Bluetooth/WiFi printer pairing and test print
- [ ] **Step 6: Create UserManagement.tsx** — admin creates/disables cashier accounts
- [ ] **Step 7: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/features/products/ src/features/settings/
git commit -m "feat: add product management and settings features"
```

---

## Task 13: Configure tsconfig.json and Final Verification

**Files:**
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: All created TypeScript files
- Produces: Strict TypeScript configuration with no type errors

- [ ] **Step 1: Update tsconfig.json** with strict settings

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-native",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "App.tsx"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

- [ ] **Step 2: Run full type check**

```bash
npx tsc --noEmit
```

Expected: Zero type errors.

- [ ] **Step 3: Run Expo build check**

```bash
npx expo prebuild --clean
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json
git commit -m "feat: configure strict TypeScript and verify full build"
```

---

## Self-Review Checklist

- [ ] All 6 ERD entities have TypeScript interfaces in `src/types/entities.ts`
- [ ] All screens are `.tsx` files with typed props and return types
- [ ] All hooks are in separate `.ts` files with typed return values
- [ ] All services are in `.ts` files with typed function signatures
- [ ] Colors are never hardcoded — all imported from `src/constants/colors.ts`
- [ ] No `any` type used anywhere (strict mode)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Folder structure matches the coding guide specification
- [ ] Role-based navigation (admin vs cashier) works correctly
- [ ] Offline sync with UUID-based duplicate prevention is typed
