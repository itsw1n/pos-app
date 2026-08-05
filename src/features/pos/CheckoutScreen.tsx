import React, { useState } from 'react';
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { PaymentMode } from '../../types/context';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { checkoutScreenStyles } from './CheckoutScreen.styles';

type CheckoutScreenProps = StackScreenProps<POSStackParamList, 'Checkout'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_MODES: Array<{ value: PaymentMode; title: string; subtitle: string }> = [
  { value: 'cash', title: 'Cash', subtitle: 'Pay with bills and coins' },
  { value: 'gcash', title: 'GCash', subtitle: 'Scan to pay with GCash' },
  { value: 'maya', title: 'Maya', subtitle: 'Scan to pay with Maya' },
];

export function CheckoutScreen({ navigation, style }: CheckoutScreenProps): React.JSX.Element {
  const { cart, getTotal } = usePOS();
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(null);
  const total = getTotal();
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const handleContinue = (): void => {
    if (!selectedMode) return;
    navigation.navigate('Payment', { paymentMode: selectedMode });
  };

  return (
    <ScrollView style={[checkoutScreenStyles.container, style]}>
      <View style={checkoutScreenStyles.summaryCard}>
        <View style={checkoutScreenStyles.summaryRow}>
          <Text style={checkoutScreenStyles.summaryLabel}>Items</Text>
          <Text style={checkoutScreenStyles.summaryValue}>{totalItems}</Text>
        </View>
        <View style={checkoutScreenStyles.summaryRow}>
          <Text style={checkoutScreenStyles.summaryLabel}>Total</Text>
          <Text style={checkoutScreenStyles.summaryTotal}>₱{total.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={checkoutScreenStyles.sectionTitle}>Select payment method</Text>

      {PAYMENT_MODES.map((mode) => {
        const isSelected = selectedMode === mode.value;
        return (
          <Pressable
            key={mode.value}
            style={({ pressed }) => [
              checkoutScreenStyles.modeCard,
              isSelected ? checkoutScreenStyles.modeCardSelected : null,
              pressed ? checkoutScreenStyles.modeCardPressed : null,
            ]}
            onPress={() => setSelectedMode(mode.value)}
          >
            <Text style={checkoutScreenStyles.modeTitle}>{mode.title}</Text>
            <Text style={checkoutScreenStyles.modeSubtitle}>{mode.subtitle}</Text>
          </Pressable>
        );
      })}

      <Pressable
        style={({ pressed }) => [
          checkoutScreenStyles.continueButton,
          pressed ? checkoutScreenStyles.continueButtonPressed : null,
          !selectedMode ? checkoutScreenStyles.continueButtonDisabled : null,
        ]}
        disabled={!selectedMode}
        onPress={handleContinue}
      >
        <Text style={checkoutScreenStyles.continueButtonText}>Continue to Payment</Text>
      </Pressable>
    </ScrollView>
  );
}
