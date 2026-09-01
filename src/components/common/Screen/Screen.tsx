import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { screenStyles } from './Screen.styles';

export interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  style,
}: ScreenProps): React.JSX.Element {
  return (
    <SafeAreaView edges={edges} style={[screenStyles.root, style]}>
      {children}
    </SafeAreaView>
  );
}
