import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { stockBadgeStyles } from './StockBadge.styles';

export type StockStatus = 'ok' | 'low' | 'critical';

export interface StockBadgeProps {
  status: StockStatus;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_LABELS: Record<StockStatus, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

const statusContainerStyles: Record<StockStatus, StyleProp<ViewStyle>> = {
  ok: stockBadgeStyles.ok,
  low: stockBadgeStyles.low,
  critical: stockBadgeStyles.critical,
};

export function StockBadge({
  status,
  label,
  style,
}: StockBadgeProps): React.JSX.Element {
  return (
    <View style={[stockBadgeStyles.root, statusContainerStyles[status], style]}>
      <Text style={stockBadgeStyles.label}>{label ?? DEFAULT_LABELS[status]}</Text>
    </View>
  );
}
