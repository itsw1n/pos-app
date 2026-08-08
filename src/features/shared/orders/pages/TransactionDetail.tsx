import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import {
  ReceiptView,
  ReceiptViewTransaction,
} from '@/components/common/ReceiptView/ReceiptView';
import { colors } from '@/theme';
import { OrdersStackParamList } from '@/features/shared/orders/OrdersNavigator';
import {
  useOrders,
  TransactionItemRow,
} from '@/features/shared/orders/hooks/useOrders';
import { transactionDetailStyles as S } from './TransactionDetail.styles';

type TransactionDetailProps = StackScreenProps<
  OrdersStackParamList,
  'TransactionDetail'
> & {
  style?: StyleProp<ViewStyle>;
};

export function TransactionDetail({
  route,
  style,
}: TransactionDetailProps): React.JSX.Element {
  const { transaction } = route.params;
  const { getTransactionItems } = useOrders();
  const [items, setItems] = useState<TransactionItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getTransactionItems(transaction.id).then((resolved) => {
      if (!active) return;
      setItems(resolved);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [transaction.id, getTransactionItems]);

  if (isLoading) {
    return (
      <View style={[S.loadingContainer, style]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={S.loadingText}>Loading transaction...</Text>
      </View>
    );
  }

  const receiptTransaction: ReceiptViewTransaction = {
    id: transaction.id,
    order_number: transaction.order_number,
    date: transaction.date,
    cashierName: transaction.user_name,
    payment_mode: transaction.payment_mode,
    total_amount: transaction.total_amount,
    amount_received: transaction.amount_received,
    change_given: transaction.change_given,
    status: transaction.status,
    void_reason: transaction.void_reason,
    items: items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
  };

  return (
    <ScrollView
      style={[S.container, style]}
      contentContainerStyle={S.content}
      showsVerticalScrollIndicator={false}
    >
      <ReceiptView transaction={receiptTransaction} />
    </ScrollView>
  );
}
