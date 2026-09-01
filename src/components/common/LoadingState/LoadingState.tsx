import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@/theme';
import { loadingStateStyles } from './LoadingState.styles';

export interface LoadingStateProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export function LoadingState({
  message = 'Loading...',
  style,
}: LoadingStateProps): React.JSX.Element {
  return (
    <View style={[loadingStateStyles.root, style]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={loadingStateStyles.message}>{message}</Text>
    </View>
  );
}
