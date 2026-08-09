import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { code128ToSvg } from '@/utils/code128';
import { formatOrderNumber } from '@/utils/orderNumber';
import { BUSINESS } from '@/constants/business';

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  subtotal: number;
}

export interface ReceiptData {
  business_name?: string;
  transaction_id: string;
  order_number?: number;
  date: string;
  cashier_name?: string;
  payment_mode: string;
  total_amount: number;
  amount_received?: number | null;
  change_given?: number | null;
  status?: 'completed' | 'voided';
  void_reason?: string | null;
  items: ReceiptLineItem[];
}

/** 80mm thermal receipt width at 72 PPI (~3.15in). */
export const RECEIPT_WIDTH_PX = 227;
const RECEIPT_HEIGHT_ITEMS = 24;
const RECEIPT_HEIGHT_HEADER = 360;
const RECEIPT_HEIGHT_FOOTER = 200;
export const RECEIPT_BARCODE_WIDTH = 190;

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
};

/**
 * Best-effort page height so the whole receipt lands on a single narrow
 * page instead of spilling onto a second one.
 */
export function estimateReceiptHeight(items: number): number {
  return (
    RECEIPT_HEIGHT_HEADER + items * RECEIPT_HEIGHT_ITEMS + RECEIPT_HEIGHT_FOOTER
  );
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ] ?? char,
  );
}

function formatPeso(value: number | null | undefined): string {
  if (value == null) return '&nbsp;';
  return `&#8369;${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Single source of truth for the printable/sharable receipt. Both the
 * system-dialog print path (printerService) and the share PDF use this.
 */
export function buildReceiptHtml(transaction: ReceiptData): string {
  const isVoided = transaction.status === 'voided';
  const subtotal = transaction.items.reduce((sum, i) => sum + i.subtotal, 0);
  const barcodeSvg = code128ToSvg(
    transaction.transaction_id,
    RECEIPT_BARCODE_WIDTH,
    48,
  );

  const itemHtml = transaction.items
    .map((i) => {
      const name = escapeHtml(i.name);
      const qty = i.quantity;
      const line = qty > 1 ? `${qty} x ${name}` : name;
      return `
        <div class="row">
          <span class="item">${line}</span>
          <span class="amt">${formatPeso(i.subtotal)}</span>
        </div>`;
    })
    .join('');

  const voidHtml = isVoided
    ? `
      <div class="void">THIS TRANSACTION HAS BEEN VOIDED</div>
      ${transaction.void_reason ? `<div class="void-reason">Reason: ${escapeHtml(transaction.void_reason)}</div>` : ''}`
    : '';

  const cashHtml =
    transaction.payment_mode === 'cash'
      ? `
        <div class="row">
          <span>Amount Received</span>
          <span>${formatPeso(transaction.amount_received ?? 0)}</span>
        </div>
        <div class="row">
          <span>Change</span>
          <span class="change">${formatPeso(transaction.change_given ?? 0)}</span>
        </div>`
      : '';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: ${RECEIPT_WIDTH_PX}px auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: monospace, 'Courier New', monospace;
            font-size: 12px;
            color: #000;
            width: ${RECEIPT_WIDTH_PX}px;
            padding: 8px 10px;
          }
          .brand { font-size: 14px; font-weight: bold; text-align: center; }
          .addr { text-align: center; margin-top: 2px; }
          .center { text-align: center; }
          .row { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
          .item { max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .amt { text-align: right; white-space: nowrap; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .label { margin-top: 6px; font-size: 10px; text-transform: uppercase; }
          .total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
          .total-label { font-weight: bold; font-size: 13px; }
          .total-value { font-weight: bold; font-size: 13px; }
          .change { font-weight: bold; }
          .void { border: 1px dashed #000; text-align: center; font-weight: bold; margin: 8px 0; padding: 4px; }
          .void-reason { text-align: center; margin-bottom: 4px; }
          .barcode { text-align: center; margin-top: 10px; }
          .barcode-label { text-align: center; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="brand">${escapeHtml(transaction.business_name ?? BUSINESS.name)}</div>
        <div class="addr">${escapeHtml(BUSINESS.address)}</div>
        <div class="divider"></div>
        <div>${formatOrderNumber(transaction.order_number, transaction.transaction_id)}</div>
        <div>${escapeHtml(transaction.date)}</div>
        <div>Cashier: ${escapeHtml(transaction.cashier_name ?? 'Cashier')}</div>
        ${voidHtml}
        <div class="divider"></div>
        ${itemHtml}
        <div class="row">
          <span>Subtotal</span>
          <span>${formatPeso(subtotal)}</span>
        </div>
        <div class="divider"></div>
        <div class="total-row">
          <span class="total-label">TOTAL</span>
          <span class="total-value">${formatPeso(transaction.total_amount)}</span>
        </div>
        <div class="label">Payment Method</div>
        <div>${escapeHtml(PAYMENT_LABEL[transaction.payment_mode] ?? transaction.payment_mode)}</div>
        <div>${cashHtml}</div>
        <div class="divider"></div>
        <div class="barcode">${barcodeSvg}</div>
        <div class="barcode-label">${formatOrderNumber(transaction.order_number, transaction.transaction_id)}</div>
      </body>
    </html>
  `;
}

export async function generateReceipt(
  transaction: ReceiptData,
): Promise<string> {
  const { uri } = await Print.printToFileAsync({
    html: buildReceiptHtml(transaction),
    width: RECEIPT_WIDTH_PX,
    height: estimateReceiptHeight(transaction.items.length),
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  return uri;
}

export async function shareReceipt(uri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri);
}
