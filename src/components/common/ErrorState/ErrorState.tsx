import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { Button } from '@/components/common/Button/Button';
import { errorStateStyles } from './ErrorState.styles';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export function ErrorState({
  message,
  onRetry,
  style,
  title = 'Something went wrong',
}: ErrorStateProps): React.JSX.Element {
  return (
    <View style={[errorStateStyles.root, style]}>
      <Text style={errorStateStyles.title}>{title}</Text>
      <Text style={errorStateStyles.message}>{message}</Text>
      {onRetry ? (
        <Button
          onPress={onRetry}
          size="small"
          style={errorStateStyles.action}
          variant="outline"
        >
          Try again
        </Button>
      ) : null}
    </View>
  );
}
