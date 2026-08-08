import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../../../theme';

export const tabBarIconStyles = StyleSheet.create({
  container: {
    width: spacing['4xl'],
    height: spacing['4xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: spacing['4xl'],
    height: spacing['4xl'],
    borderRadius: radius.full,
    backgroundColor: colors.navActive,
    ...shadows.hover,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
