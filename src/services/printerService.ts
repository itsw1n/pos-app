import * as Print from 'expo-print';
import ThermalPrinter, {
  Device,
  ScanResult,
  Node,
  text,
  line,
  barcode,
  columns,
  feed,
  cut,
} from 'react-native-thermal-printer-driver';
import { RECEIPT_WIDTH_PX, buildReceiptHtml } from './receiptService';
import { getPrinterConfig } from './printerStorage';
import type { PrinterConfig } from './printerStorage';

export interface ThermalDevice {
  name: string;
  address: string;
  deviceType: Device['deviceType'];
  rssi?: number;
}

export const WIFI_DEFAULT_PORT = 9100;

function toThermalDevice(device: Device): ThermalDevice {
  return {
    name: device.name,
    address: device.address,
    deviceType: device.deviceType,
    rssi: device.rssi,
  };
}

/** Bluetooth Classic address prefix expected by the driver's transport. */
function btAddress(mac: string, deviceType: Device['deviceType']): string {
  return deviceType === 'ble' ? `ble:${mac}` : `bt:${mac}`;
}

/** TCP/LAN (WiFi printer) address expected by the driver's transport. */
function lanAddress(host: string, port: number): string {
  return `lan:${host}:${port}`;
}

/**
 * Scan for Bluetooth printers (paired + discoverable). Returns an empty list
 * when Bluetooth is unsupported (e.g. web preview).
 */
export async function scanBluetoothPrinters(): Promise<ThermalDevice[]> {
  try {
    const result: ScanResult = await ThermalPrinter.scan();
    const devices = [...result.paired, ...result.found];
    return devices.map(toThermalDevice);
  } catch {
    return [];
  }
}

/**
 * Open a connection to a printer. Pass the raw device from the scanner or a
 * `lan:host:port` address built with {@link buildWifiAddress}.
 */
export async function connectPrinter(config: PrinterConfig): Promise<void> {
  const address = configAddress(config);
  await ThermalPrinter.connect(address, { timeout: 10000 });
}

function configAddress(config: PrinterConfig): string {
  if (config.type === 'wifi') {
    return lanAddress(config.address, config.port ?? WIFI_DEFAULT_PORT);
  }
  return btAddress(config.address, config.deviceType ?? 'bt');
}

export function buildWifiAddress(host: string, port: number): string {
  return lanAddress(host, port);
}

export async function testPrinterConnection(
  config: PrinterConfig,
): Promise<ThermalPrinterTestResult> {
  const address = configAddress(config);
  try {
    const result = await ThermalPrinter.testConnection(address);
    return { ok: result.success, deviceName: result.deviceName };
  } catch {
    return { ok: false };
  }
}

export interface ThermalPrinterTestResult {
  ok: boolean;
  deviceName?: string;
}

export const PRINT_FEED_LINES_AFTER = 3;

/** Minimal ESC/POS document used by the PrinterSettings test button. */
export function buildTestDocument(): Node[] {
  return [
    text('Elvira Cafe', { align: 'center', bold: true, size: 2 }),
    text('Printer Test', { align: 'center', bold: true }),
    line(),
    text('If you can read this, the printer is connected.', {
      align: 'center',
    }),
    text(`Sent: ${new Date().toLocaleString()}`, { align: 'center' }),
    feed(PRINT_FEED_LINES_AFTER),
    cut(),
  ];
}

/**
 * Print a small test receipt to a thermal device. Throws when the device is
 * unreachable.
 */
export async function printThermalTest(config: PrinterConfig): Promise<void> {
  const address = configAddress(config);
  try {
    await ThermalPrinter.connect(address, { timeout: 10000 });
  } catch {
    // Connection may be pooled; attempt the print anyway.
  }
  const result = await ThermalPrinter.print(address, buildTestDocument(), {
    paperWidthMm: 80,
    timeout: 15000,
  });
  if (!result.success) {
    throw new Error(result.error?.message ?? 'Test print failed');
  }
}

/** Column width fractions for the items section (sum must stay <= 1). */
const ITEM_NAME_FRACTION = 0.62;
const ITEM_QTY_FRACTION = 0.13;

/**
 * Build the ESC/POS document for a transaction. Uses 80mm paper.
 */
export function buildReceiptDocument(transaction: ReceiptDocumentData): Node[] {
  const width = RECEIPT_WIDTH_PX;

  return [
    text(transaction.business_name ?? 'Elvira Cafe', {
      align: 'center',
      bold: true,
      size: 2,
    }),
    text('Davao City, Philippines', { align: 'center' }),
    line(),
    text(`Order: ${transaction.order_number ?? transaction.transaction_id}`, {
      align: 'center',
    }),
    text(transaction.date, { align: 'center' }),
    text(`Cashier: ${transaction.cashierName ?? 'Cashier'}`, {
      align: 'center',
    }),
    ...(transaction.status === 'voided'
      ? [
          text('THIS TRANSACTION HAS BEEN VOIDED', {
            align: 'center',
            bold: true,
          }),
          ...(transaction.void_reason
            ? [text(`Reason: ${transaction.void_reason}`, { align: 'center' })]
            : []),
        ]
      : []),
    line(),
    ...transaction.items.flatMap((item) => [
      columns([
        {
          content: item.name,
          width: ITEM_NAME_FRACTION,
        },
        {
          content: `x${item.quantity}`,
          width: ITEM_QTY_FRACTION,
          align: 'left',
        },
        {
          content: formatPeso(item.subtotal),
          width: 1 - ITEM_NAME_FRACTION - ITEM_QTY_FRACTION,
          align: 'right',
        },
      ]),
    ]),
    line(),
    columns([
      { content: 'Subtotal', width: 0.6 },
      {
        content: formatPeso(subtotalOf(transaction.items)),
        width: 0.4,
        align: 'right',
      },
    ]),
    feed(1),
    columns([
      { content: 'TOTAL', width: 0.6, style: { bold: true } },
      {
        content: formatPeso(transaction.total_amount),
        width: 0.4,
        align: 'right',
        style: { bold: true },
      },
    ]),
    feed(1),
    text('Payment Method', { font: 'A', size: 1 }),
    text(paymentLabel(transaction.payment_mode), {}),
    feed(1),
    ...(transaction.payment_mode === 'cash'
      ? [
          columns([
            { content: 'Amount Received', width: 0.6 },
            {
              content: formatPeso(transaction.amount_received ?? 0),
              width: 0.4,
              align: 'right',
            },
          ]),
          columns([
            { content: 'Change', width: 0.6 },
            {
              content: formatPeso(transaction.change_given ?? 0),
              width: 0.4,
              align: 'right',
            },
          ]),
        ]
      : []),
    feed(1),
    barcode(transaction.transaction_id, {
      format: 'CODE128',
      height: 60,
      width: Math.round(width * 0.85),
      hri: 'below',
    }),
    feed(2),
    cut(),
  ];
}

export interface ReceiptItemData {
  name: string;
  quantity: number;
  subtotal: number;
}

export interface ReceiptDocumentData {
  business_name?: string;
  transaction_id: string;
  order_number?: number;
  date: string;
  cashierName?: string;
  payment_mode: string;
  total_amount: number;
  amount_received?: number | null;
  change_given?: number | null;
  status?: 'completed' | 'voided';
  void_reason?: string | null;
  items: ReceiptItemData[];
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function subtotalOf(items: ReceiptItemData[]): number {
  return items.reduce((sum, i) => sum + i.subtotal, 0);
}

function paymentLabel(mode: string): string {
  switch (mode) {
    case 'cash':
      return 'Cash';
    case 'gcash':
      return 'GCash';
    case 'maya':
      return 'Maya';
    default:
      return mode;
  }
}

/**
 * Print a receipt to the configured thermal printer (Bluetooth/WiFi).
 * Returns the used device address, or null when no printer is configured
 * (caller should fall back to the system-dialog path).
 */
export async function printReceiptToThermal(
  transaction: ReceiptDocumentData,
): Promise<{ address: string } | null> {
  const config = await getPrinterConfig();
  if (!config) return null;

  const address = configAddress(config);
  const document = buildReceiptDocument(transaction);

  try {
    await ThermalPrinter.connect(address, { timeout: 10000 });
  } catch {
    // Connection may be reused; still attempt the print below.
  }

  const result = await ThermalPrinter.print(address, document, {
    paperWidthMm: 80,
    timeout: 15000,
  });
  if (!result.success) {
    throw new Error(result.error?.message ?? 'Thermal print failed');
  }
  return { address };
}

/**
 * Legacy system print dialog (Android Print Manager / iOS AirPrint).
 * Kept as the fallback when no thermal printer is configured, and used by the
 * PrinterSettings test flow on devices without a thermal printer.
 */
export async function printReceipt(html: string): Promise<void> {
  await Print.printAsync({ html });
}

/**
 * Print via the system dialog using the shared receipt HTML builder.
 * Used as a fallback when no thermal printer is configured.
 */
export async function printReceiptHtmlFallback(
  transaction: ReceiptDocumentData,
): Promise<void> {
  await printReceipt(buildReceiptHtml(transaction));
}
