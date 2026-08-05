import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { colors } from '../../theme';
import { TransactionsStackParamList } from './TransactionsNavigator';
import { useTransactions } from './useTransactions';
import { voidScreenStyles } from './VoidScreen.styles';

type VoidScreenProps = StackScreenProps<TransactionsStackParamList, 'Void'> & {
  style?: StyleProp<ViewStyle>;
};

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function VoidScreen({ navigation, route, style }: VoidScreenProps): React.JSX.Element {
  const { transactionId, date, total } = route.params;
  const { isVoiding, voidTransaction } = useTransactions();

  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const reasonIsValid = useMemo(() => reason.trim().length > 0, [reason]);

  const handleConfirm = async (): Promise<void> => {
    if (!reasonIsValid || isVoiding) return;
    setError('');
    try {
      await voidTransaction(transactionId, reason);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to void transaction');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[voidScreenStyles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={voidScreenStyles.content} keyboardShouldPersistTaps="handled">
        <View style={voidScreenStyles.warningBanner}>
          <Text style={voidScreenStyles.warningTitle}>Confirm Void</Text>
          <Text style={voidScreenStyles.warningText}>
            Voiding restores sold quantities back to inventory and excludes this sale from reports.
            This action cannot be undone.
          </Text>
        </View>

        <View style={voidScreenStyles.summaryCard}>
          <View style={voidScreenStyles.summaryRow}>
            <Text style={voidScreenStyles.summaryLabel}>Date</Text>
            <Text style={voidScreenStyles.summaryValue}>{new Date(date).toLocaleString()}</Text>
          </View>
          <View style={voidScreenStyles.summaryRow}>
            <Text style={voidScreenStyles.summaryLabel}>Total</Text>
            <Text style={voidScreenStyles.summaryValue}>{formatPeso(total)}</Text>
          </View>
        </View>

        <View style={voidScreenStyles.formCard}>
          <Text style={voidScreenStyles.inputLabel}>Reason for void *</Text>
          <TextInput
            style={voidScreenStyles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Required — e.g. wrong item, customer returned"
            placeholderTextColor={colors.textSecondary}
            multiline
            editable={!isVoiding}
          />
          {!reasonIsValid ? (
            <Text style={voidScreenStyles.hintText}>A reason is required to void this transaction.</Text>
          ) : null}
        </View>

        {error ? <Text style={voidScreenStyles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            voidScreenStyles.confirmButton,
            pressed ? voidScreenStyles.confirmButtonPressed : null,
            !reasonIsValid || isVoiding ? voidScreenStyles.confirmButtonDisabled : null,
          ]}
          disabled={!reasonIsValid || isVoiding}
          onPress={handleConfirm}
        >
          {isVoiding ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={voidScreenStyles.confirmButtonText}>Confirm Void</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
