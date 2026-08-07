import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Switch,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../transactions/useTransactions';
import { colors } from '../../theme';
import { SettingsStackParamList } from './SettingsNavigator';
import { settingsScreenStyles as styles } from './SettingsScreen.styles';

type SettingsScreenProps = StackScreenProps<SettingsStackParamList, 'SettingsHome'> & {
  style?: StyleProp<ViewStyle>;
};

interface SettingsRow {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  caption?: string;
  onPress?: () => void;
  trailing?: React.JSX.Element;
}

export function SettingsScreen({
  navigation,
  style,
}: SettingsScreenProps): React.JSX.Element {
  const { user, role, logout } = useAuth();
  const { transactions: txs } = useTransactions();
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase();

  const renderGroup = (rows: SettingsRow[]): React.JSX.Element => (
    <View style={styles.group}>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const content = (
          <>
            <View style={styles.iconCircle}>
              <Ionicons name={row.icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              {row.caption ? <Text style={styles.rowCaption}>{row.caption}</Text> : null}
            </View>
            {row.trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
          </>
        );
        if (row.onPress) {
          return (
            <Pressable
              key={row.key}
              style={({ pressed }) => [
                styles.row,
                isLast ? styles.rowLast : null,
                pressed ? styles.rowPressed : null,
              ]}
              onPress={row.onPress}
            >
              {content}
            </Pressable>
          );
        }
        return (
          <View key={row.key} style={[styles.row, isLast ? styles.rowLast : null]}>
            {content}
          </View>
        );
      })}
    </View>
  );

  const accountRows: SettingsRow[] = [
    {
      key: 'personal-info',
      icon: 'person-outline',
      title: 'Personal Information',
      caption: 'Update your name, email, and phone',
    },
    {
      key: 'security',
      icon: 'lock-closed-outline',
      title: 'Security & Password',
      caption: 'Change your password and enable 2FA',
    },
  ];
  if (role === 'admin') {
    accountRows.push({
      key: 'products',
      icon: 'pricetags-outline',
      title: 'Product Management',
      caption: 'Add, edit, and remove menu items',
      onPress: () => navigation.navigate('Products'),
    });
  }

  const applicationRows: SettingsRow[] = [
    {
      key: 'notifications',
      icon: 'notifications-outline',
      title: 'Notification Preferences',
      caption: 'Manage sales and stock notifications',
    },
    {
      key: 'dark-mode',
      icon: 'moon-outline',
      title: 'Dark Mode',
      trailing: (
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      ),
    },
  ];

  const printerRows: SettingsRow[] = [];
  if (role === 'admin') {
    printerRows.push({
      key: 'connect-printer',
      icon: 'print-outline',
      title: 'Connect Printer',
      caption: 'Pair a Bluetooth or WiFi printer',
      onPress: () => navigation.navigate('PrinterSettings'),
    });
  }
  printerRows.push({
    key: 'reconnect-test',
    icon: 'refresh-outline',
    title: 'Reconnect & Test Print',
    caption: 'Reconnect and verify the receipt printer',
    onPress: () => navigation.navigate('PrinterSettings'),
  });

  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <Text style={styles.topBarTitle}>ElviraCafe POS</Text>
        <View style={styles.topBarSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.username}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {role === 'admin' ? 'Admin' : `Cashier ID #${user?.user_id}`}
            </Text>
          </View>
          <View style={styles.ordersChip}>
            <Text style={styles.ordersChipLabel}>Orders Processed</Text>
            <Text style={styles.ordersChipValue}>{txs.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
        {renderGroup(accountRows)}

        <Text style={styles.sectionLabel}>APPLICATION</Text>
        {renderGroup(applicationRows)}

        <Text style={styles.sectionLabel}>PRINTER</Text>
        {renderGroup(printerRows)}

        {role === 'admin' ? (
          <View style={styles.userCard}>
            <Pressable
              style={({ pressed }) => [
                styles.row,
                styles.rowLast,
                pressed ? styles.rowPressed : null,
              ]}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="people-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>User Management</Text>
                <Text style={styles.rowCaption}>Create and disable staff accounts</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.logout, pressed ? styles.logoutPressed : null]}
          onPress={() => void logout()}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.footer}>IPSS v1.0 • Elvira Cafe</Text>
      </ScrollView>
    </SafeAreaView>
  );
}