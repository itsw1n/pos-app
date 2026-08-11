import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const loadingStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  surface: {
    flex: 1,
  },
});

export const navigationStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
