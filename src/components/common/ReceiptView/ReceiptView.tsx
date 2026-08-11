import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Coffee, Printer, Share } from 'lucide-react-native';
import { generateReceipt, shareReceipt } from '@/services/receiptService';
import {
  printReceiptToThermal,
  printReceiptHtmlFallback,
  ReceiptDocumentData,
} from '@/services/printerService';
import { PaymentMode } from '@/types/context';
import { colors } from '@/theme';
import { BUSINESS } from '@/constants/business';
import { formatOrderNumber } from '@/utils/orderNumber';
import { Barcode } from '@/components/common/Barcode/Barcode';
import { receiptViewStyles } from './ReceiptView.styles';

export interface ReceiptViewItem {
  name: string;
  quantity: number;
  subtotal: number;
}

export interface ReceiptViewTransaction {
  id: string;
  order_number?: number;
  date: string;
  cashierName?: string;
  payment_mode: PaymentMode;
  total_amount: number;
  amount_received?: number | null;
  change_given?: number | null;
  status?: 'completed' | 'voided';
  void_reason?: string | null;
  items: ReceiptViewItem[];
}

interface ReceiptViewProps {
  transaction: ReceiptViewTransaction;
  primaryAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const PAYMENT_LABEL: Record<PaymentMode, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function formatPeso(value: number | null | undefined): string {
  if (value == null) return '₱0.00';
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ReceiptView({
  transaction,
  primaryAction,
  style,
}: ReceiptViewProps): React.JSX.Element {
  const isVoided = transaction.status === 'voided';

  const subtotal = transaction.items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleShare = async (): Promise<void> => {
    const uri = await generateReceipt({
      transaction_id: transaction.id,
      order_number: transaction.order_number,
      date: transaction.date,
      cashier_name: transaction.cashierName,
      payment_mode: transaction.payment_mode,
      total_amount: transaction.total_amount,
      amount_received: transaction.amount_received,
      change_given: transaction.change_given,
      status: transaction.status,
      void_reason: transaction.void_reason,
      items: transaction.items,
    });
    await shareReceipt(uri);
  };

  const handlePrint = async (): Promise<void> => {
    const document: ReceiptDocumentData = {
      transaction_id: transaction.id,
      order_number: transaction.order_number,
      date: transaction.date,
      cashierName: transaction.cashierName,
      payment_mode: transaction.payment_mode,
      total_amount: transaction.total_amount,
      amount_received: transaction.amount_received,
      change_given: transaction.change_given,
      status: transaction.status,
      void_reason: transaction.void_reason,
      items: transaction.items,
    };
    const thermalResult = await printReceiptToThermal(document);
    if (!thermalResult) {
      await printReceiptHtmlFallback(document);
    }
  };

  return (
    <View style={[receiptViewStyles.root, style]}>
      <View style={receiptViewStyles.receiptCard}>
        <View style={receiptViewStyles.receiptHeader}>
          <View style={receiptViewStyles.receiptIconCircle}>
            <Coffee size={22} color={colors.primary} />
          </View>
          <Text style={receiptViewStyles.receiptBrand}>{BUSINESS.name}</Text>
          <Text style={receiptViewStyles.receiptAddress}>
            {BUSINESS.address}
          </Text>
        </View>

        <View style={receiptViewStyles.receiptMeta}>
          <Text style={receiptViewStyles.receiptMetaText}>
            {formatOrderNumber(transaction.order_number, transaction.id)}
          </Text>
          <Text style={receiptViewStyles.receiptMetaText}>
            {formatDate(transaction.date)}
          </Text>
        </View>

        <View style={receiptViewStyles.cashierRow}>
          <Text style={receiptViewStyles.cashierLabel}>Cashier</Text>
          <Text style={receiptViewStyles.cashierValue}>
            {transaction.cashierName ?? 'Cashier'}
          </Text>
        </View>

        {isVoided && (
          <>
            <View style={receiptViewStyles.voidBanner}>
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={colors.danger}
              />
              <Text style={receiptViewStyles.voidBannerText}>
                THIS TRANSACTION HAS BEEN VOIDED
              </Text>
            </View>
            {transaction.void_reason ? (
              <Text style={receiptViewStyles.voidReason}>
                Reason: {transaction.void_reason}
              </Text>
            ) : null}
          </>
        )}

        <View style={receiptViewStyles.receiptItems}>
          {transaction.items.map((item, index) => (
            <View key={index} style={receiptViewStyles.itemRow}>
              <Text style={receiptViewStyles.itemName} numberOfLines={1}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={receiptViewStyles.itemSubtotal}>
                ₱{item.subtotal.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={receiptViewStyles.receiptTotals}>
          <View style={receiptViewStyles.itemRow}>
            <Text style={receiptViewStyles.itemName}>Subtotal</Text>
            <Text style={receiptViewStyles.itemSubtotal}>
              ₱{subtotal.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={receiptViewStyles.receiptGrandTotal}>
          <Text style={receiptViewStyles.grandTotalLabel}>TOTAL</Text>
          <Text style={receiptViewStyles.grandTotalValue}>
            ₱{transaction.total_amount.toFixed(2)}
          </Text>
        </View>

        <View style={receiptViewStyles.paymentMethodRow}>
          <Text style={receiptViewStyles.paymentMethodLabel}>
            PAYMENT METHOD
          </Text>
          <Text style={receiptViewStyles.paymentMethodValue}>
            {PAYMENT_LABEL[transaction.payment_mode]}
          </Text>
        </View>

        {transaction.payment_mode === 'cash' && (
          <>
            <View style={receiptViewStyles.amountRow}>
              <Text style={receiptViewStyles.amountLabel}>Amount Received</Text>
              <Text style={receiptViewStyles.amountValue}>
                {formatPeso(transaction.amount_received ?? 0)}
              </Text>
            </View>

            <View style={receiptViewStyles.amountRow}>
              <Text style={receiptViewStyles.amountLabel}>Change</Text>
              <Text style={receiptViewStyles.amountValueChange}>
                {formatPeso(transaction.change_given ?? 0)}
              </Text>
            </View>
          </>
        )}

        <View style={receiptViewStyles.dashedDivider} />

        <View style={receiptViewStyles.barcodeSection}>
          <Barcode value={transaction.id} height={56} />
          <Text style={receiptViewStyles.barcodeText}>
            {formatOrderNumber(transaction.order_number, transaction.id)}
          </Text>
        </View>
      </View>

      <View style={receiptViewStyles.actions}>
        {primaryAction}

        <View style={receiptViewStyles.secondaryRow}>
          <Pressable
            style={({ pressed }) => [
              receiptViewStyles.secondaryButton,
              pressed ? receiptViewStyles.secondaryButtonPressed : null,
            ]}
            onPress={handlePrint}
          >
            <Printer size={16} color={colors.textPrimary} />
            <Text style={receiptViewStyles.secondaryButtonText}>Print</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              receiptViewStyles.secondaryButton,
              pressed ? receiptViewStyles.secondaryButtonPressed : null,
            ]}
            onPress={handleShare}
          >
            <Share size={16} color={colors.textPrimary} />
            <Text style={receiptViewStyles.secondaryButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
