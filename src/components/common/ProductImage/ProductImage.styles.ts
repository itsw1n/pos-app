import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';

export const productImageStyles = StyleSheet.create({
  tileBase: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tile: {
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 28,
  },
});
