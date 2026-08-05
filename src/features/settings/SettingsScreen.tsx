import React from 'react';
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { SettingsStackParamList } from './SettingsNavigator';
import { settingsScreenStyles } from './SettingsScreen.styles';

type SettingsScreenProps = StackScreenProps<SettingsStackParamList, 'SettingsHome'> & {
  style?: StyleProp<ViewStyle>;
};

interface SettingsEntry {
  key: string;
  title: string;
  caption: string;
  adminOnly: boolean;
  onPress: () => void;
}

export function SettingsScreen({
  navigation,
  style,
}: SettingsScreenProps): React.JSX.Element {
  const { role } = useAuth();

  const entries: SettingsEntry[] = [
    {
      key: 'printer',
      title: 'Printer Settings',
      caption: 'Pair and test the receipt printer',
      adminOnly: false,
      onPress: () => navigation.navigate('PrinterSettings'),
    },
    {
      key: 'products',
      title: 'Product Management',
      caption: 'Add, edit, and remove menu items',
      adminOnly: true,
      onPress: () => navigation.navigate('Products'),
    },
    {
      key: 'users',
      title: 'User Management',
      caption: 'Create and disable staff accounts',
      adminOnly: true,
      onPress: () => navigation.navigate('UserManagement'),
    },
  ];

  const visibleEntries = role === 'admin' ? entries : entries.filter((entry) => !entry.adminOnly);

  return (
    <ScrollView
      style={[settingsScreenStyles.container, style]}
      contentContainerStyle={settingsScreenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {visibleEntries.map((entry, index) => (
        <Pressable
          key={entry.key}
          style={({ pressed }) => [
            settingsScreenStyles.entryCard,
            pressed ? settingsScreenStyles.entryCardPressed : null,
            index === 0 ? settingsScreenStyles.entryCardFirst : null,
          ]}
          onPress={entry.onPress}
        >
          <View style={settingsScreenStyles.entryInfo}>
            {entry.adminOnly ? (
              <View style={settingsScreenStyles.adminBadge}>
                <Text style={settingsScreenStyles.adminBadgeText}>Admin</Text>
              </View>
            ) : null}
            <Text style={settingsScreenStyles.entryTitle}>{entry.title}</Text>
            <Text style={settingsScreenStyles.entryCaption}>{entry.caption}</Text>
          </View>
          <Text style={settingsScreenStyles.chevron}>›</Text>
        </Pressable>
      ))}
      <Text style={settingsScreenStyles.footer}>IPSS - Cafe Elvira</Text>
    </ScrollView>
  );
}
