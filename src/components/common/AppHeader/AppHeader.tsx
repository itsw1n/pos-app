import React, { useCallback } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import { Coffee } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../theme';
import { appHeaderStyles as styles } from './AppHeader.styles';

interface AppHeaderProps {
  pageTitle: string;
  style?: StyleProp<ViewStyle>;
}

export function AppHeader({
  pageTitle,
  style,
}: AppHeaderProps): React.JSX.Element {
  const { user, role } = useAuth();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase();

  const handleLogoPress = useCallback((): void => {
    navigation.navigate(role === 'admin' ? 'Dashboard' : 'Menu');
  }, [navigation, role]);

  return (
    <View style={[styles.header, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go to home"
        hitSlop={8}
        onPress={handleLogoPress}
        style={({ pressed }) => [styles.logoButton, pressed && styles.pressed]}
      >
        <View style={styles.logoMark}>
          <Coffee size={22} color={colors.surface} />
        </View>
      </Pressable>

      <View style={styles.titleWrap}>
        <Text style={styles.brandName} numberOfLines={1}>
          ElviraCoffee POS
        </Text>
        <Text style={styles.pageTitle} numberOfLines={1}>
          {pageTitle}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => navigation.navigate('Settings')}
        style={({ pressed }) => [
          styles.profileButton,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </Pressable>
    </View>
  );
}
