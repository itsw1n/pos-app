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
import {
  Check,
  Coffee,
  Plus,
  Printer,
  Settings,
  Share,
} from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { generateReceipt, shareReceipt } from '@/services/receiptService';
import { printReceipt } from '@/services/printerService';
import { POSTransaction } from '@/types/context';
import { colors } from '@/theme';
import { MenuStackParamList } from '@/features/cashier/menu/MenuNavigator';
import { receiptStyles } from './Receipt.styles';

type ReceiptProps = StackScreenProps<MenuStackParamList, 'Receipt'> & {
  style?: StyleProp<ViewStyle>;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export function Receipt({
  navigation,
  route,
  style,
}: ReceiptProps): React.JSX.Element {
  const { transaction } = route.params;

  const receiptItems = transaction.items.map((item) => ({
    name: item.name,
    quantity: item.qty,
    subtotal: item.price * item.qty,
  }));

  const subtotal = receiptItems.reduce((sum, i) => sum + i.subtotal, 0);

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
      </body></html>`,
    );
  };

  return (
    <SafeAreaView style={[receiptStyles.container, style]}>
      <View style={receiptStyles.topBar}>
        <View style={receiptStyles.topBarBalance} />
        <Text style={receiptStyles.topBarTitle}>Elvira Cafe</Text>
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

        <View style={receiptStyles.receiptCard}>
          <View style={receiptStyles.receiptHeader}>
            <View style={receiptStyles.receiptIconCircle}>
              <Coffee size={22} color={colors.primary} />
            </View>
            <Text style={receiptStyles.receiptBrand}>Elvira Cafe</Text>
            <Text style={receiptStyles.receiptAddress}>
              Jalan Raya Elvira No. 12, Jakarta
            </Text>
          </View>

          <View style={receiptStyles.receiptMeta}>
            <Text style={receiptStyles.receiptMetaText}>
              Order #{transaction.id.slice(0, 4).toUpperCase()}
            </Text>
            <Text style={receiptStyles.receiptMetaText}>
              {formatDate(transaction.date)}
            </Text>
          </View>

          <View style={receiptStyles.receiptItems}>
            {receiptItems.map((item, index) => (
              <View key={index} style={receiptStyles.itemRow}>
                <Text style={receiptStyles.itemName} numberOfLines={1}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={receiptStyles.itemSubtotal}>
                  ₱{item.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={receiptStyles.receiptTotals}>
            <View style={receiptStyles.itemRow}>
              <Text style={receiptStyles.itemName}>Subtotal</Text>
              <Text style={receiptStyles.itemSubtotal}>
                ₱{subtotal.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={receiptStyles.receiptGrandTotal}>
            <Text style={receiptStyles.grandTotalLabel}>TOTAL</Text>
            <Text style={receiptStyles.grandTotalValue}>
              ₱{transaction.total_amount.toFixed(2)}
            </Text>
          </View>

          <View style={receiptStyles.paymentMethodRow}>
            <Text style={receiptStyles.paymentMethodLabel}>PAYMENT METHOD</Text>
            <Text style={receiptStyles.paymentMethodValue}>
              {paymentLabel[transaction.payment_mode]}
            </Text>
          </View>

          <View style={receiptStyles.dashedDivider} />

          <View style={receiptStyles.barcodeSection}>
            {/* TODO: replace with barcode library later */}
            <View style={receiptStyles.barcodePlaceholder} />
            <Text style={receiptStyles.barcodeText}>
              Thanks for visiting Elvira Cafe
            </Text>
          </View>

          <View style={receiptStyles.receiptEdge} />
        </View>

        <View style={receiptStyles.actions}>
          <Pressable
            style={receiptStyles.newTransactionButton}
            onPress={() => navigation.popToTop()}
          >
            <Plus size={18} color={colors.surface} />
            <Text style={receiptStyles.newTransactionButtonText}>
              New Transaction
            </Text>
          </Pressable>

          <View style={receiptStyles.secondaryRow}>
            <Pressable
              style={({ pressed }) => [
                receiptStyles.secondaryButton,
                pressed ? receiptStyles.secondaryButtonPressed : null,
              ]}
              onPress={handlePrint}
            >
              <Printer size={16} color={colors.textPrimary} />
              <Text style={receiptStyles.secondaryButtonText}>Print</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                receiptStyles.secondaryButton,
                pressed ? receiptStyles.secondaryButtonPressed : null,
              ]}
              onPress={handleShare}
            >
              <Share size={16} color={colors.textPrimary} />
              <Text style={receiptStyles.secondaryButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
