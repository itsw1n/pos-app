import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { cardStyles } from './Card.styles';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, children, style }: CardProps): React.JSX.Element {
  return (
    <View style={[cardStyles.root, style]}>
      {title ? <Text style={cardStyles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}
