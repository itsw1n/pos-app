import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Check, Plus, Settings } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  ReceiptView,
  ReceiptViewTransaction,
} from '@/components/common/ReceiptView/ReceiptView';
import { POSTransaction } from '@/types/context';
import { colors } from '@/theme';
import { BUSINESS } from '@/constants/business';
import { MenuStackParamList } from '@/features/cashier/menu/MenuNavigator';
import { receiptStyles } from './Receipt.styles';

type ReceiptProps = StackScreenProps<MenuStackParamList, 'Receipt'> & {
  style?: StyleProp<ViewStyle>;
};

// The receipt/detail screen may be opened with a richer transaction object
// (e.g. from the Orders history) carrying cashier, status and void metadata.
// Navigation route params are intentionally left untouched, so we read these
// optional fields through a typed accessor (no `any`).
type ReceiptTransaction = Omit<POSTransaction, 'status'> & {
  user?: { full_name?: string | null; username?: string | null };
  status?: 'completed' | 'voided';
  void_reason?: string | null;
};

export function Receipt({
  navigation,
  route,
  style,
}: ReceiptProps): React.JSX.Element {
  const transaction = route.params.transaction as ReceiptTransaction;
  const viewMode = (route.params as { viewMode?: boolean }).viewMode ?? false;

  const cashierName =
    transaction.user?.full_name ?? transaction.user?.username ?? 'Cashier';

  const receiptTransaction: ReceiptViewTransaction = {
    id: transaction.id,
    order_number: transaction.order_number,
    date: transaction.date,
    cashierName,
    payment_mode: transaction.payment_mode,
    total_amount: transaction.total_amount,
    amount_received: transaction.amount_received,
    change_given: transaction.change_given,
    status: transaction.status,
    void_reason: transaction.void_reason,
    items: transaction.items.map((item) => ({
      name: item.name,
      quantity: item.qty,
      subtotal: item.price * item.qty,
    })),
  };

  return (
    <SafeAreaView style={[receiptStyles.container, style]}>
      <View style={receiptStyles.topBar}>
        <View style={receiptStyles.topBarBalance} />
        <Text style={receiptStyles.topBarTitle}>{BUSINESS.name}</Text>
        <Pressable
          onPress={() => navigation.getParent()?.navigate('Settings' as never)}
        >
          <Settings size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={receiptStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={receiptStyles.successHeader}>
          <View style={receiptStyles.successCircle}>
            <Check size={28} color={colors.surface} />
          </View>
          <Text style={receiptStyles.successTitle}>Payment Successful</Text>
          <Text style={receiptStyles.successSubtitle}>
            Thank you for your visit!
          </Text>
        </View>

        <ReceiptView
          transaction={receiptTransaction}
          primaryAction={
            !viewMode ? (
              <Pressable
                style={receiptStyles.newTransactionButton}
                onPress={() => navigation.popToTop()}
              >
                <Plus size={18} color={colors.surface} />
                <Text style={receiptStyles.newTransactionButtonText}>
                  New Transaction
                </Text>
              </Pressable>
            ) : undefined
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
