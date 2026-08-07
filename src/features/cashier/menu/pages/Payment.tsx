import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  QrCode,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { InputField } from '@/components/common/InputField/InputField';
import { PaymentMode } from '@/types/context';
import { colors, typography } from '@/theme';
import { MenuStackParamList } from '@/features/cashier/menu/MenuNavigator';
import { useMenu } from '@/features/cashier/menu/hooks/useMenu';
import { paymentStyles } from './Payment.styles';

type PaymentProps = StackScreenProps<MenuStackParamList, 'Payment'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_METHODS: Array<{ value: PaymentMode; label: string; icon: LucideIcon }> = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'gcash', label: 'GCash', icon: Smartphone },
  { value: 'maya', label: 'Maya', icon: Wallet },
];

export function Payment({ navigation, route, style }: PaymentProps): React.JSX.Element {
  const { getTotal, processTransaction } = useMenu();
  const total = getTotal();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMode>(route.params.paymentMode ?? 'cash');
  const [amountText, setAmountText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const amountReceived = parseFloat(amountText);
  const isCash = selectedMethod === 'cash';
  const amountIsValid = !Number.isNaN(amountReceived) && amountReceived > 0;
  const cashIsSufficient = !isCash || (amountIsValid && amountReceived >= total);
  const change = isCash && amountIsValid ? amountReceived - total : null;
  const canConfirm = isCash ? amountIsValid && cashIsSufficient : !isProcessing;

  const handleConfirm = async (): Promise<void> => {
    if (isProcessing) return;
    setError('');
    setIsProcessing(true);
    try {
      const finalAmount = isCash ? amountReceived : total;
      const transaction = await processTransaction(selectedMethod, finalAmount);
      navigation.replace('Receipt', { transaction });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[paymentStyles.container, style]}>
      <View style={paymentStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={paymentStyles.topBarTitle}>Payment</Text>
        <View style={paymentStyles.topBarBalance} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={paymentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={paymentStyles.totalSection}>
          <Text style={paymentStyles.totalLabel}>Total Amount Due</Text>
          <Text style={paymentStyles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Text style={paymentStyles.sectionLabel}>PAYMENT METHOD</Text>

        <View style={paymentStyles.methodList}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.value;
            return (
              <Pressable
                key={method.value}
                style={[
                  paymentStyles.paymentOption,
                  isSelected ? paymentStyles.paymentOptionSelected : null,
                ]}
                onPress={() => setSelectedMethod(method.value)}
              >
                <View style={paymentStyles.iconCircle}>
                  <method.icon size={18} color={colors.primary} />
                </View>
                <Text style={paymentStyles.optionLabel}>{method.label}</Text>
                {isSelected ? (
                  <View style={paymentStyles.selectIndicator}>
                    <Check size={14} color={colors.surface} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {isCash ? (
          <View style={paymentStyles.cashSection}>
            <View style={paymentStyles.amountGroup}>
              <Text style={paymentStyles.amountLabel}>AMOUNT RECEIVED</Text>
              <InputField
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="decimal-pad"
                placeholder="Php 0.000"
                disabled={isProcessing}
                inputStyle={{ ...typography.xl, fontWeight: '600' }}
                error={
                  amountIsValid && amountReceived < total
                    ? 'Amount received is less than the total'
                    : undefined
                }
              />
            </View>

            <View style={paymentStyles.changeRow}>
              <Text style={paymentStyles.changeLabel}>CHANGE</Text>
              <Text
                style={[
                  paymentStyles.changeValue,
                  change !== null && change < 0 ? paymentStyles.changeNegative : null,
                ]}
              >
                {change !== null && change >= 0 ? `₱${change.toFixed(2)}` : '—'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={paymentStyles.hint}>
            <QrCode size={20} color={colors.primary} />
            <Text style={paymentStyles.hintText}>
              Ask customer to scan the QR code on the counter
            </Text>
          </View>
        )}

        {error ? <Text style={paymentStyles.errorText}>{error}</Text> : null}

        <Pressable
          style={[
            paymentStyles.confirmButton,
            !canConfirm ? paymentStyles.confirmButtonDisabled : null,
          ]}
          disabled={!canConfirm}
          onPress={handleConfirm}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Text style={paymentStyles.confirmButtonText}>Confirm Payment</Text>
              <ArrowRight size={18} color={colors.surface} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}