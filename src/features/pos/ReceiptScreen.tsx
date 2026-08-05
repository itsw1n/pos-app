import React from 'react';
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { generateReceipt, shareReceipt } from '../../services/receiptService';
import { printReceipt } from '../../services/printerService';
import { POSTransaction } from '../../types/context';
import { POSStackParamList } from './POSNavigator';
import { receiptScreenStyles } from './ReceiptScreen.styles';

type ReceiptScreenProps = StackScreenProps<POSStackParamList, 'Receipt'> & {
  style?: StyleProp<ViewStyle>;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export function ReceiptScreen({ navigation, route, style }: ReceiptScreenProps): React.JSX.Element {
  const { transaction } = route.params;

  const receiptItems = transaction.items.map((item) => ({
    name: item.name,
    quantity: item.qty,
    subtotal: item.price * item.qty,
  }));

  const paymentLabel: Record<POSTransaction['payment_mode'], string> = {
    cash: 'Cash',
    gcash: 'GCash',
    maya: 'Maya',
  };

  const handleShare = async (): Promise<void> => {
    const uri = await generateReceipt({
      transaction_id: transaction.id,
      total_amount: transaction.total_amount,
      payment_mode: transaction.payment_mode,
      date: transaction.date,
      items: receiptItems,
    });
    await shareReceipt(uri);
  };

  const handlePrint = async (): Promise<void> => {
    const itemHtml = receiptItems
      .map((i) => `<p>${i.name} x${i.quantity} = ${i.subtotal.toFixed(2)}</p>`)
      .join('');
    await printReceipt(
      `<html><body style="font-family: monospace; padding: 20px;">
        <h3>IPSS - Cafe Elvira</h3>
        <p>Transaction: ${transaction.id}</p>
        <p>Date: ${transaction.date}</p>
        <p>Payment: ${paymentLabel[transaction.payment_mode]}</p>
        <hr />
        ${itemHtml}
        <hr />
        <p><strong>Total: ${transaction.total_amount.toFixed(2)}</strong></p>
        ${transaction.change_given !== null ? `<p>Change: ${transaction.change_given.toFixed(2)}</p>` : ''}
      </body></html>`
    );
  };

  return (
    <ScrollView style={[receiptScreenStyles.container, style]}>
      <View style={receiptScreenStyles.receiptCard}>
        <View style={receiptScreenStyles.receiptHeader}>
          <Text style={receiptScreenStyles.receiptBrand}>IPSS - Cafe Elvira</Text>
          <Text style={receiptScreenStyles.receiptMeta}>{formatDate(transaction.date)}</Text>
          <Text style={receiptScreenStyles.receiptId}>#{transaction.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        {receiptItems.map((item, index) => (
          <View key={index} style={receiptScreenStyles.itemRow}>
            <Text style={receiptScreenStyles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={receiptScreenStyles.itemQty}>x{item.quantity}</Text>
            <Text style={receiptScreenStyles.itemSubtotal}>{item.subtotal.toFixed(2)}</Text>
          </View>
        ))}

        <View style={receiptScreenStyles.divider} />

        <View style={receiptScreenStyles.totalRow}>
          <Text style={receiptScreenStyles.totalLabel}>Total</Text>
          <Text style={receiptScreenStyles.totalValue}>₱{transaction.total_amount.toFixed(2)}</Text>
        </View>

        {transaction.amount_received !== null ? (
          <View style={receiptScreenStyles.totalRow}>
            <Text style={receiptScreenStyles.totalLabel}>Amount received</Text>
            <Text style={receiptScreenStyles.totalValue}>
              ₱{transaction.amount_received.toFixed(2)}
            </Text>
          </View>
        ) : null}

        {transaction.change_given !== null ? (
          <View style={receiptScreenStyles.totalRow}>
            <Text style={receiptScreenStyles.totalLabel}>Change</Text>
            <Text style={receiptScreenStyles.changeValue}>
              ₱{transaction.change_given.toFixed(2)}
            </Text>
          </View>
        ) : null}

        <View style={receiptScreenStyles.paymentBadge}>
          <Text style={receiptScreenStyles.paymentBadgeText}>
            {paymentLabel[transaction.payment_mode]}
          </Text>
        </View>
      </View>

      <View style={receiptScreenStyles.actions}>
        <Pressable
          style={({ pressed }) => [
            receiptScreenStyles.actionButton,
            pressed ? receiptScreenStyles.actionButtonPressed : null,
          ]}
          onPress={handleShare}
        >
          <Text style={receiptScreenStyles.actionButtonText}>Share Receipt</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            receiptScreenStyles.actionButton,
            pressed ? receiptScreenStyles.actionButtonPressed : null,
          ]}
          onPress={handlePrint}
        >
          <Text style={receiptScreenStyles.actionButtonText}>Print Receipt</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            receiptScreenStyles.primaryButton,
            pressed ? receiptScreenStyles.primaryButtonPressed : null,
          ]}
          onPress={() => navigation.popToTop()}
        >
          <Text style={receiptScreenStyles.primaryButtonText}>New Sale</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
