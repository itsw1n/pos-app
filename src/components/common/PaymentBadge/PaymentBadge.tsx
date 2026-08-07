import React from 'react';
import { Text, View } from 'react-native';
import { paymentBadgeStyles } from './PaymentBadge.styles';

export type PaymentMode = 'cash' | 'gcash' | 'maya';

const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
};

export interface PaymentBadgeProps {
  mode: PaymentMode;
}

export function PaymentBadge({ mode }: PaymentBadgeProps): React.JSX.Element {
  return (
    <View style={paymentBadgeStyles.badge}>
      <Text style={paymentBadgeStyles.label}>{PAYMENT_MODE_LABEL[mode]}</Text>
    </View>
  );
}
