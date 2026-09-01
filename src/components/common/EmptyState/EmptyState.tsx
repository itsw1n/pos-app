import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { emptyStateStyles } from './EmptyState.styles';

export interface EmptyStateProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
  title: string;
}

export function EmptyState({
  message,
  style,
  title,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View style={[emptyStateStyles.root, style]}>
      <Text style={emptyStateStyles.title}>{title}</Text>
      {message ? <Text style={emptyStateStyles.message}>{message}</Text> : null}
    </View>
  );
}
