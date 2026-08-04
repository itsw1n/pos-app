import { useState } from "react";

const Colors = {
  primary: "#364C35",
  secondary: "#4D644B",
  navActive: "#ADC5AB",
  bg: "#F5F5F5",
  surface: "#FFFFFF",
  success: "#4CAF72",
  warning: "#F5A623",
  danger: "#E8614A",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  border: "#E0E0E0",
};

const tabs = ["Architecture", "Folder Structure", "Code Pattern", "Where to Start", "Build Order"];

const Badge = ({ text, color }) => {
  const colors = {
    green: { bg: "#E1F5EE", text: "#085041" },
    orange: { bg: "#FEF3E2", text: "#7A4100" },
    blue: { bg: "#E6F1FB", text: "#0C447C" },
    red: { bg: "#FCEBEB", text: "#791F1F" },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 500, marginLeft: 6 }}>
      {text}
    </span>
  );
};

const Card = ({ title, children, badge }) => (
  <div style={{ background: Colors.surface, border: `0.5px solid ${Colors.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
    {title && <div style={{ fontSize: 14, fontWeight: 500, color: Colors.textPrimary, marginBottom: 6 }}>{title}{badge}</div>}
    <div style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 1.6 }}>{children}</div>
  </div>
);

const Code = ({ children }) => (
  <pre style={{
    background: "#1A1A1A", color: "#ADC5AB", borderRadius: 8, padding: "12px 14px",
    fontSize: 12, lineHeight: 1.7, overflowX: "auto", margin: "8px 0",
    fontFamily: "monospace", whiteSpace: "pre"
  }}>{children}</pre>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: Colors.textSecondary, textTransform: "uppercase", margin: "14px 0 8px" }}>{children}</div>
);

const Step = ({ num, title, badge, badgeColor, children }) => (
  <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: Colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>{num}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: Colors.textPrimary, marginBottom: 4 }}>
        {title}{badge && <Badge text={badge} color={badgeColor || "green"} />}
      </div>
      <div style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 1.6 }}>{children}</div>
    </div>
  </div>
);

function Architecture() {
  return (
    <div>
      <SectionLabel>Overall Pattern</SectionLabel>
      <Card title="Feature-Based Architecture" badge={<Badge text="Recommended" color="green" />}>
        Group all files by feature (auth, pos, inventory, reports) — not by file type. Easy to navigate, easy to explain during capstone defense.
      </Card>
      <SectionLabel>3-Layer Architecture</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card title="Layer 1 — UI / Screens">
          React Native screens and components only. No business logic. Just what the user sees and taps.
        </Card>
        <Card title="Layer 2 — Services / Hooks">
          All business logic lives here. API calls, SQLite, sync, receipt generation.
        </Card>
      </div>
      <Card title="Layer 3 — Data / Storage">
        Supabase (online) + SQLite via expo-sqlite (offline). Services talk to this — screens never touch the DB directly.
      </Card>
      <SectionLabel>Data Flow</SectionLabel>
      <Code>{`Screen (user taps)
  → calls Hook / Service
    → Service checks: online? → Supabase
                      offline? → SQLite (expo-sqlite)
      → returns result to Screen
        → Screen updates UI`}</Code>
      <SectionLabel>Offline Sync Flow</SectionLabel>
      <Code>{`Transaction saved → SQLite (synced: false)
  → Internet restored → SyncService detects connection
    → Push all unsynced records to Supabase
      → Mark synced: true in SQLite
        → No duplicates because of UUID transaction IDs`}</Code>
      <SectionLabel>Navigation Architecture</SectionLabel>
      <Code>{`App.js
└── AuthContext (global user + role)
    └── if not logged in → LoginScreen
    └── if role === 'cashier' → CashierTabNavigator
    │     Menu | Orders | Inventory (view) | Settings
    └── if role === 'admin' → AdminTabNavigator
          Menu | Orders | Dashboard | Settings`}</Code>
    </div>
  );
}

function FolderStructure() {
  return (
    <div>
      <SectionLabel>Full Project Folder Structure</SectionLabel>
      <Code>{`ipss-cafe-elvira/
├── src/
│   ├── app/
│   │   ├── index.jsx          ← entry, auth check
│   │   └── navigation.jsx     ← stack + tab navigators
│   │
│   ├── features/              ← grouped by feature
│   │   ├── auth/
│   │   │   ├── LoginScreen.jsx
│   │   │   └── useAuth.js     ← login logic hook
│   │   ├── pos/
│   │   │   ├── POSScreen.jsx
│   │   │   ├── CartScreen.jsx
│   │   │   ├── CheckoutScreen.jsx
│   │   │   ├── PaymentScreen.jsx
│   │   │   ├── ReceiptScreen.jsx
│   │   │   └── usePOS.js
│   │   ├── inventory/
│   │   │   ├── InventoryScreen.jsx    ← admin full
│   │   │   ├── InventoryViewScreen.jsx ← cashier read-only
│   │   │   ├── StockInScreen.jsx
│   │   │   └── useInventory.js
│   │   ├── reports/
│   │   │   ├── ReportsScreen.jsx
│   │   │   ├── DashboardScreen.jsx
│   │   │   └── useReports.js
│   │   ├── transactions/
│   │   │   ├── TransactionHistoryScreen.jsx
│   │   │   ├── VoidScreen.jsx
│   │   │   └── useTransactions.js
│   │   ├── products/
│   │   │   ├── ProductsScreen.jsx
│   │   │   ├── AddEditProductScreen.jsx
│   │   │   └── useProducts.js
│   │   └── settings/
│   │       ├── SettingsScreen.jsx
│   │       ├── PrinterSettings.jsx
│   │       └── UserManagement.jsx
│   │
│   ├── services/              ← all logic, no UI
│   │   ├── supabase.js        ← supabase client
│   │   ├── sqlite.js          ← local db setup
│   │   ├── syncService.js     ← offline → supabase sync
│   │   ├── receiptService.js  ← generate PDF receipt
│   │   └── printerService.js  ← bluetooth/wifi print
│   │
│   ├── components/            ← shared reusable UI
│   │   ├── Button.jsx
│   │   ├── ProductCard.jsx
│   │   ├── StockBadge.jsx     ← green/yellow/red
│   │   └── ReceiptView.jsx
│   │
│   ├── constants/
│   │   ├── colors.js          ← all palette hex codes
│   │   └── roles.js           ← 'admin' | 'cashier'
│   │
│   └── context/
│       ├── AuthContext.jsx    ← global user + role
│       └── CartContext.jsx    ← global cart state
│
├── App.js                     ← root entry
├── app.json                   ← expo config
└── .env                       ← supabase keys (never commit)`}</Code>
    </div>
  );
}

function CodePattern() {
  return (
    <div>
      <SectionLabel>Rule: Logic in Hooks, UI in Screens</SectionLabel>
      <Card>Every feature has its own hook. Screens only call the hook — zero business logic in screen files. Keeps code clean and easy to debug.</Card>

      <SectionLabel>Example: usePOS.js (logic)</SectionLabel>
      <Code>{`// src/features/pos/usePOS.js
import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { saveToSQLite } from '../../services/sqlite'
import NetInfo from '@react-native-community/netinfo'
import uuid from 'react-native-uuid'

export function usePOS() {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      )
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (productId) =>
    setCart(prev => prev.filter(i => i.id !== productId))

  const getTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  const processTransaction = async (paymentMode, amountReceived) => {
    const transaction = {
      id: uuid.v4(),
      total_amount: getTotal(),
      payment_mode: paymentMode,
      amount_received: amountReceived || null,
      change_given: paymentMode === 'cash'
        ? amountReceived - getTotal() : null,
      status: 'completed',
      items: cart,
      synced: false,
    }
    const { isConnected } = await NetInfo.fetch()
    if (isConnected) {
      await supabase.from('transaction').insert(transaction)
    } else {
      await saveToSQLite('transactions', transaction)
    }
    setCart([]) // clear cart after sale
    return transaction
  }

  return { cart, addToCart, removeFromCart, getTotal, processTransaction }
}`}</Code>

      <SectionLabel>Example: POSScreen.jsx (UI only)</SectionLabel>
      <Code>{`// src/features/pos/POSScreen.jsx
import { usePOS } from './usePOS'
import ProductCard from '../../components/ProductCard'

export default function POSScreen() {
  const { cart, addToCart, getTotal } = usePOS()

  return (
    <View>
      <ProductGrid onSelect={addToCart} />
      <CartSummary cart={cart} total={getTotal()} />
    </View>
  )
}`}</Code>

      <SectionLabel>Colors — Never Hardcode</SectionLabel>
      <Code>{`// src/constants/colors.js
export const Colors = {
  primary:       '#364C35',  // Dark Forest Green
  secondary:     '#4D644B',  // Olive Green
  navActive:     '#ADC5AB',  // Nav active tab
  background:    '#F5F5F5',  // App background
  surface:       '#FFFFFF',  // Cards, inputs
  success:       '#4CAF72',  // Stock OK / green
  warning:       '#F5A623',  // Low stock / yellow
  danger:        '#E8614A',  // Critical / void / red
  disabled:      '#C2C5C5',  // Out of stock greyed
  textPrimary:   '#1A1A1A',
  textSecondary: '#6B6B6B',
}

// Usage in any screen:
import { Colors } from '../../constants/colors'
<View style={{ backgroundColor: Colors.background }} />`}</Code>

      <SectionLabel>AuthContext — Global Role State</SectionLabel>
      <Code>{`// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)  // 'admin' | 'cashier'

  const login = async (username, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    })
    if (error) throw error
    // fetch role from users table
    const { data: profile } = await supabase
      .from('user').select('role').eq('user_id', data.user.id).single()
    setUser(data.user)
    setRole(profile.role)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)`}</Code>
    </div>
  );
}

function WhereToStart() {
  return (
    <div>
      <SectionLabel>Day 1 — Project Setup (always do this first)</SectionLabel>
      <Step num={1} title="Initialize Expo project">
        <Code>{`npx create-expo-app ipss-cafe-elvira --template blank
cd ipss-cafe-elvira`}</Code>
      </Step>
      <Step num={2} title="Install all dependencies">
        <Code>{`# Navigation
npm install @react-navigation/native @react-navigation/stack
npm install @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Supabase
npm install @supabase/supabase-js

# Offline storage
npx expo install expo-sqlite

# Receipt
npx expo install expo-print expo-sharing

# Network detection
npx expo install @react-native-community/netinfo

# UUID for transaction IDs
npm install react-native-uuid`}</Code>
      </Step>
      <Step num={3} title="Create Supabase project">
        Go to supabase.com → New project → Create all 6 tables from the ERD (user, product, transaction, transaction_item, inventory, stock_movement) → Enable Row Level Security → Copy API URL and anon key.
      </Step>
      <Step num={4} title="Set up .env file">
        <Code>{`# .env (never commit this to GitHub!)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}</Code>
      </Step>
      <Step num={5} title="Create Supabase client">
        <Code>{`// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
)`}</Code>
      </Step>
      <Step num={6} title="Create the full folder structure">
        Create all folders from the Folder Structure tab before writing any feature code. Empty folders are fine.
      </Step>
      <Step num={7} title="Create constants/colors.js">
        Add all palette hex codes here first. Every screen imports from this file — never hardcode colors.
      </Step>
      <Step num={8} title="Test Supabase connection">
        <Code>{`// quick test in App.js
import { supabase } from './src/services/supabase'

useEffect(() => {
  supabase.from('product').select('*').then(console.log)
}, [])`}</Code>
      </Step>
    </div>
  );
}

function BuildOrder() {
  const steps = [
    { title: "Authentication + AuthContext", badge: "Week 1", color: "green", desc: "Login screen → Supabase Auth → AuthContext (global user + role) → Role-based navigation (cashier nav vs admin nav) → Logout. Get this SOLID before anything else. Everything depends on knowing the user's role." },
    { title: "Navigation Shell", badge: "Week 1", color: "green", desc: "Both bottom tab navigators — Cashier (Menu|Orders|Inventory|Settings) and Admin (Menu|Orders|Dashboard|Settings). Empty placeholder screens are fine. Just get role-based navigation working." },
    { title: "Product Management", badge: "Week 2", color: "orange", desc: "Admin: Add/Edit/Delete products in Supabase. This feeds the POS screen — must exist before you build POS." },
    { title: "POS / Sales Transaction", badge: "Week 2–3", color: "orange", desc: "Menu screen → Category tabs → Add to cart → Checkout → Payment (Cash/GCash/Maya) → Change computation → Save transaction → Auto-deduct inventory → Receipt screen. This is THE core feature. Spend the most time here." },
    { title: "Inventory Management", badge: "Week 3", color: "orange", desc: "Admin full inventory screen → Stock-in → Reorder levels → Stock movement history. Cashier read-only view with Green/Yellow/Red color status. Low-stock alerts for both roles." },
    { title: "Offline Support (expo-sqlite)", badge: "Week 3–4", color: "orange", desc: "Set up local SQLite schema → Save transactions offline → SyncService pushes to Supabase when online → NetInfo for connectivity detection → UUID-based duplicate prevention." },
    { title: "Transaction History + Void", badge: "Week 4", color: "orange", desc: "Cashier: own transactions only. Admin: all transactions. Void with required reason → Inventory auto-restored on void confirmation." },
    { title: "Receipt Generation + Printer", badge: "Week 4–5", color: "blue", desc: "Digital receipt via expo-print → PDF share via expo-sharing → Bluetooth printer → WiFi printer → Cashier reconnect/test print in settings." },
    { title: "Reports + Dashboard (Admin)", badge: "Week 5", color: "blue", desc: "Dashboard: revenue, total orders, weekly bar chart, low-stock, top products. Reports: daily/weekly/monthly sales and inventory. Charts via Victory Native." },
    { title: "User Management + Settings", badge: "Week 5–6", color: "blue", desc: "Admin creates/disables cashier accounts. Settings: password change, notifications, printer pairing (admin) and reconnect/test (cashier)." },
    { title: "Polish + Testing + APK Build", badge: "Week 6", color: "red", desc: "Apply full Figma design consistently → Match all Figma screens → Run full 22-item checklist → Fix all bugs → Expo EAS Build → Final APK → Install on café device → Client approval." },
  ];

  return (
    <div>
      <SectionLabel>Build Features in This Exact Order</SectionLabel>
      <Card>
        Build from the core outward. Auth first, then navigation, then POS (the heart of the system), then supporting features, then polish. Never skip ahead — each step depends on the previous one.
      </Card>
      {steps.map((s, i) => (
        <Step key={i} num={i + 1} title={s.title} badge={s.badge} badgeColor={s.color}>
          {s.desc}
        </Step>
      ))}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const panels = [Architecture, FolderStructure, CodePattern, WhereToStart, BuildOrder];
  const Panel = panels[activeTab];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: Colors.bg, minHeight: "100vh", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: Colors.primary, padding: "20px 20px 16px" }}>
        <div style={{ fontSize: 11, color: Colors.navActive, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>IPSS — Cafe Elvira</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>Coding Architecture Guide</div>
        <div style={{ fontSize: 13, color: Colors.navActive, marginTop: 4 }}>React Native + Expo + Supabase</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "14px 16px", flexWrap: "wrap", background: Colors.surface, borderBottom: `0.5px solid ${Colors.border}` }}>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "none",
              background: activeTab === i ? Colors.primary : Colors.bg,
              color: activeTab === i ? "#fff" : Colors.textSecondary,
              fontSize: 12, fontWeight: activeTab === i ? 500 : 400,
              cursor: "pointer", transition: "all 0.15s"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px", maxWidth: 800, margin: "0 auto" }}>
        <Panel />
      </div>
    </div>
  );
}
