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
import { InputField } from '../../components/common/InputField/InputField';
import { PaymentMode } from '../../types/context';
import { colors, typography } from '../../theme';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { paymentScreenStyles } from './PaymentScreen.styles';

type PaymentScreenProps = StackScreenProps<POSStackParamList, 'Payment'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_METHODS: Array<{ value: PaymentMode; label: string; icon: LucideIcon }> = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'gcash', label: 'GCash', icon: Smartphone },
  { value: 'maya', label: 'Maya', icon: Wallet },
];

export function PaymentScreen({ navigation, route, style }: PaymentScreenProps): React.JSX.Element {
  const { getTotal, processTransaction } = usePOS();
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
    <SafeAreaView style={[paymentScreenStyles.container, style]}>
      <View style={paymentScreenStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={paymentScreenStyles.topBarTitle}>Payment</Text>
        <View style={paymentScreenStyles.topBarBalance} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={paymentScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={paymentScreenStyles.totalSection}>
          <Text style={paymentScreenStyles.totalLabel}>Total Amount Due</Text>
          <Text style={paymentScreenStyles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Text style={paymentScreenStyles.sectionLabel}>PAYMENT METHOD</Text>

        <View style={paymentScreenStyles.methodList}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.value;
            return (
              <Pressable
                key={method.value}
                style={[
                  paymentScreenStyles.paymentOption,
                  isSelected ? paymentScreenStyles.paymentOptionSelected : null,
                ]}
                onPress={() => setSelectedMethod(method.value)}
              >
                <View style={paymentScreenStyles.iconCircle}>
                  <method.icon size={18} color={colors.primary} />
                </View>
                <Text style={paymentScreenStyles.optionLabel}>{method.label}</Text>
                {isSelected ? (
                  <View style={paymentScreenStyles.selectIndicator}>
                    <Check size={14} color={colors.surface} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {isCash ? (
          <View style={paymentScreenStyles.cashSection}>
            <View style={paymentScreenStyles.amountGroup}>
              <Text style={paymentScreenStyles.amountLabel}>AMOUNT RECEIVED</Text>
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

            <View style={paymentScreenStyles.changeRow}>
              <Text style={paymentScreenStyles.changeLabel}>CHANGE</Text>
              <Text
                style={[
                  paymentScreenStyles.changeValue,
                  change !== null && change < 0 ? paymentScreenStyles.changeNegative : null,
                ]}
              >
                {change !== null && change >= 0 ? `₱${change.toFixed(2)}` : '—'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={paymentScreenStyles.hint}>
            <QrCode size={20} color={colors.primary} />
            <Text style={paymentScreenStyles.hintText}>
              Ask customer to scan the QR code on the counter
            </Text>
          </View>
        )}

        {error ? <Text style={paymentScreenStyles.errorText}>{error}</Text> : null}

        <Pressable
          style={[
            paymentScreenStyles.confirmButton,
            !canConfirm ? paymentScreenStyles.confirmButtonDisabled : null,
          ]}
          disabled={!canConfirm}
          onPress={handleConfirm}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Text style={paymentScreenStyles.confirmButtonText}>Confirm Payment</Text>
              <ArrowRight size={18} color={colors.surface} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}