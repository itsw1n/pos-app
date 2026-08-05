import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleProp, Text, TextInput, View, ViewStyle } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { PaymentMode } from '../../types/context';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { paymentScreenStyles } from './PaymentScreen.styles';
import { colors } from '../../theme';

type PaymentScreenProps = StackScreenProps<POSStackParamList, 'Payment'> & {
  style?: StyleProp<ViewStyle>;
};

export function PaymentScreen({ navigation, route, style }: PaymentScreenProps): React.JSX.Element {
  const { paymentMode } = route.params;
  const { getTotal, processTransaction } = usePOS();
  const total = getTotal();

  const [amountText, setAmountText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const amountReceived = parseFloat(amountText);
  const isCash = paymentMode === 'cash';
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
      const transaction = await processTransaction(paymentMode, finalAmount);
      navigation.replace('Receipt', { transaction });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const modeTitle: Record<PaymentMode, string> = {
    cash: 'Cash',
    gcash: 'GCash',
    maya: 'Maya',
  };

  return (
    <KeyboardAvoidingView
      style={[paymentScreenStyles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={paymentScreenStyles.summaryCard}>
        <Text style={paymentScreenStyles.summaryLabel}>Total due ({modeTitle[paymentMode]})</Text>
        <Text style={paymentScreenStyles.summaryValue}>₱{total.toFixed(2)}</Text>
      </View>

      {isCash ? (
        <View style={paymentScreenStyles.inputCard}>
          <Text style={paymentScreenStyles.inputLabel}>Amount received</Text>
          <TextInput
            style={[
              paymentScreenStyles.input,
              amountIsValid && amountReceived < total ? paymentScreenStyles.inputError : null,
            ]}
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            editable={!isProcessing}
          />
          <View style={paymentScreenStyles.changeRow}>
            <Text style={paymentScreenStyles.changeLabel}>Change</Text>
            <Text style={paymentScreenStyles.changeValue}>
              {change !== null && change >= 0 ? `₱${change.toFixed(2)}` : '—'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={paymentScreenStyles.inputCard}>
          <Text style={paymentScreenStyles.inputLabel}>
            {paymentMode === 'gcash' ? 'GCash' : 'Maya'} payment
          </Text>
          <Text style={paymentScreenStyles.summaryValue}>₱{total.toFixed(2)}</Text>
        </View>
      )}

      {error ? <Text style={paymentScreenStyles.errorText}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          paymentScreenStyles.confirmButton,
          pressed ? paymentScreenStyles.confirmButtonPressed : null,
          !canConfirm ? paymentScreenStyles.confirmButtonDisabled : null,
        ]}
        disabled={!canConfirm}
        onPress={handleConfirm}
      >
        {isProcessing ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={paymentScreenStyles.confirmButtonText}>Complete Sale</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}
