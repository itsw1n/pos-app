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
import { Check, Coffee, Plus, Printer, Settings, Share } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { generateReceipt, shareReceipt } from '../../services/receiptService';
import { printReceipt } from '../../services/printerService';
import { POSTransaction } from '../../types/context';
import { colors } from '../../theme';
import { POSStackParamList } from './POSNavigator';
import { receiptScreenStyles } from './ReceiptScreen.styles';

type ReceiptScreenProps = StackScreenProps<POSStackParamList, 'Receipt'> & {
  style?: StyleProp<ViewStyle>;
};

const TAX_RATE = 0.11;

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

  const subtotal = receiptItems.reduce((sum, i) => sum + i.subtotal, 0);
  const tax = subtotal * TAX_RATE;

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
        <h3>Elvira Cafe</h3>
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
    <SafeAreaView style={[receiptScreenStyles.container, style]}>
      <View style={receiptScreenStyles.topBar}>
        <View style={receiptScreenStyles.topBarBalance} />
        <Text style={receiptScreenStyles.topBarTitle}>Elvira Cafe</Text>
        <Pressable onPress={() => navigation.getParent()?.navigate('Settings' as never)}>
          <Settings size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={receiptScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={receiptScreenStyles.successHeader}>
          <View style={receiptScreenStyles.successCircle}>
            <Check size={28} color={colors.surface} />
          </View>
          <Text style={receiptScreenStyles.successTitle}>Payment Successful</Text>
          <Text style={receiptScreenStyles.successSubtitle}>Thank you for your visit!</Text>
        </View>

        <View style={receiptScreenStyles.receiptCard}>
          <View style={receiptScreenStyles.receiptHeader}>
            <View style={receiptScreenStyles.receiptIconCircle}>
              <Coffee size={22} color={colors.primary} />
            </View>
            <Text style={receiptScreenStyles.receiptBrand}>Elvira Cafe</Text>
            <Text style={receiptScreenStyles.receiptAddress}>
              Jalan Raya Elvira No. 12, Jakarta
            </Text>
          </View>

          <View style={receiptScreenStyles.receiptMeta}>
            <Text style={receiptScreenStyles.receiptMetaText}>
              Order #{transaction.id.slice(0, 4).toUpperCase()}
            </Text>
            <Text style={receiptScreenStyles.receiptMetaText}>{formatDate(transaction.date)}</Text>
          </View>

          <View style={receiptScreenStyles.receiptItems}>
            {receiptItems.map((item, index) => (
              <View key={index} style={receiptScreenStyles.itemRow}>
                <Text style={receiptScreenStyles.itemName} numberOfLines={1}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={receiptScreenStyles.itemSubtotal}>₱{item.subtotal.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={receiptScreenStyles.receiptTotals}>
            <View style={receiptScreenStyles.itemRow}>
              <Text style={receiptScreenStyles.itemName}>Subtotal</Text>
              <Text style={receiptScreenStyles.itemSubtotal}>₱{subtotal.toFixed(2)}</Text>
            </View>
            {/*
              TODO: confirm Tax with client
            */}
            <View style={receiptScreenStyles.itemRow}>
              <Text style={receiptScreenStyles.itemName}>Tax (11%)</Text>
              <Text style={receiptScreenStyles.itemSubtotal}>₱{tax.toFixed(2)}</Text>
            </View>
          </View>

          <View style={receiptScreenStyles.receiptGrandTotal}>
            <Text style={receiptScreenStyles.grandTotalLabel}>TOTAL</Text>
            <Text style={receiptScreenStyles.grandTotalValue}>₱{transaction.total_amount.toFixed(2)}</Text>
          </View>

          <View style={receiptScreenStyles.paymentMethodRow}>
            <Text style={receiptScreenStyles.paymentMethodLabel}>PAYMENT METHOD</Text>
            <Text style={receiptScreenStyles.paymentMethodValue}>
              {paymentLabel[transaction.payment_mode]}
            </Text>
          </View>

          <View style={receiptScreenStyles.dashedDivider} />

          <View style={receiptScreenStyles.barcodeSection}>
            {/* TODO: replace with barcode library later */}
            <View style={receiptScreenStyles.barcodePlaceholder} />
            <Text style={receiptScreenStyles.barcodeText}>Thanks for visiting Elvira Cafe</Text>
          </View>

          <View style={receiptScreenStyles.receiptEdge} />
        </View>

        <View style={receiptScreenStyles.actions}>
          <Pressable
            style={receiptScreenStyles.newTransactionButton}
            onPress={() => navigation.popToTop()}
          >
            <Plus size={18} color={colors.surface} />
            <Text style={receiptScreenStyles.newTransactionButtonText}>New Transaction</Text>
          </Pressable>

          <View style={receiptScreenStyles.secondaryRow}>
            <Pressable
              style={({ pressed }) => [
                receiptScreenStyles.secondaryButton,
                pressed ? receiptScreenStyles.secondaryButtonPressed : null,
              ]}
              onPress={handlePrint}
            >
              <Printer size={16} color={colors.textPrimary} />
              <Text style={receiptScreenStyles.secondaryButtonText}>Print</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                receiptScreenStyles.secondaryButton,
                pressed ? receiptScreenStyles.secondaryButtonPressed : null,
              ]}
              onPress={handleShare}
            >
              <Share size={16} color={colors.textPrimary} />
              <Text style={receiptScreenStyles.secondaryButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}