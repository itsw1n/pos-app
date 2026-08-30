import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Offline-first export service — Inventory + Transactions to .xlsx with CSV fallback.
 *
 * Design notes (senior hardening):
 * - Batching: rows can be 10k+. `exceljs` `writeBuffer` is O(n) memory. We add rows in
 *   1000-row chunks and yield via `setImmediate`/`setTimeout(0)` every 5k rows to avoid
 *   freezing the JS thread on low-end Android. Documented limit: 10k tested, scales linearly.
 * - BOM: CSV fallback prefixes UTF-8 BOM `\ufeff` so Windows Excel opens correctly.
 * - Cleanup: `export*` returns a `file://` uri in `FileSystem.cacheDirectory`; caller
 *   deletes via `FileSystem.deleteAsync(uri, { idempotent: true })` after
 *   `Sharing.shareAsync` dismiss. `export*` never deletes — safe for retry.
 * - No PII: Inventory rows have no email/password; Transactions expose `cashier` username
 *   only (already visible in Reports), never emails beyond what UI shows.
 * - No network: writes to `cacheDirectory` only, works offline; sharing requires no network.
 */

// Lazy require so Metro can fall back to CSV if exceljs ever fails to bundle.
// We keep the type narrow without `any`.
let ExcelJS: typeof import('exceljs') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExcelJS = require('exceljs') as typeof import('exceljs');
} catch {
  // Metro fallback → CSV
  ExcelJS = null;
}

export interface InventoryExportRow {
  product_id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  reorder_level: number;
  status: 'ok' | 'low' | 'critical';
  stock_value: number;
  supplier?: string | null;
}

export interface TransactionExportRow {
  order_number: number | null;
  transaction_id: string;
  date: string;
  items_summary: string;
  payment_mode: string;
  total_amount: number;
  status: string;
  cashier: string;
}

const INVENTORY_HEADERS = [
  'product_id',
  'name',
  'category',
  'price',
  'quantity',
  'reorder_level',
  'status',
  'stock_value',
  'supplier',
] as const;

const TRANSACTIONS_HEADERS = [
  'order_number',
  'transaction_id',
  'date',
  'items_summary',
  'payment_mode',
  'total_amount',
  'status',
  'cashier',
] as const;

/**
 * RFC4180 quoting: double quotes escaped as `""`, field wrapped in quotes
 * if it contains comma, quote, or newline (`\n`/`\r`). Used by both CSV builders.
 * Example: `a"b, c\nd` → `"a""b, c\nd"`.
 */
export function escapeCsvValue(value: string): string {
  const needsQuotes =
    value.includes('"') ||
    value.includes(',') ||
    value.includes('\n') ||
    value.includes('\r');
  if (value.includes('"')) {
    value = value.replace(/"/g, '""');
  }
  return needsQuotes ? `"${value}"` : value;
}

/**
 * Build Inventory CSV with BOM + RFC4180 quoting. Header is always emitted
 * even for 0 rows. No PII beyond `supplier` (plain string).
 */
export function buildInventoryCsv(rows: InventoryExportRow[]): string {
  const lines: string[] = [];
  lines.push(INVENTORY_HEADERS.map(escapeCsvValue).join(','));
  for (const r of rows) {
    const cells: string[] = [
      String(r.product_id),
      r.name ?? '',
      r.category ?? '',
      String(r.price),
      String(r.quantity),
      String(r.reorder_level),
      r.status ?? '',
      String(r.stock_value),
      r.supplier ?? '',
    ].map(escapeCsvValue);
    lines.push(cells.join(','));
  }
  // UTF-8 BOM so Excel on Windows opens correctly — see file header batching/BOM notes
  return '\ufeff' + lines.join('\n');
}

/**
 * Build Transactions CSV with BOM + RFC4180 quoting. `cashier` is username only
 * (no emails/passwords). Header emitted even for 0 rows.
 */
export function buildTransactionsCsv(rows: TransactionExportRow[]): string {
  const lines: string[] = [];
  lines.push(TRANSACTIONS_HEADERS.map(escapeCsvValue).join(','));
  for (const r of rows) {
    const cells: string[] = [
      r.order_number != null ? String(r.order_number) : '',
      r.transaction_id ?? '',
      r.date ?? '',
      r.items_summary ?? '',
      r.payment_mode ?? '',
      String(r.total_amount),
      r.status ?? '',
      r.cashier ?? '',
    ].map(escapeCsvValue);
    lines.push(cells.join(','));
  }
  return '\ufeff' + lines.join('\n');
}

function getDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCacheDirectory(): string {
  return FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  // Prefer Node Buffer when available (tests / Metro), else btoa fallback
  const maybeBuffer = (
    globalThis as unknown as {
      Buffer?: { from: (b: Uint8Array) => { toString: (e: string) => string } };
    }
  ).Buffer;
  if (maybeBuffer) {
    return maybeBuffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa exists in jsdom / RN Hermes
  return globalThis.btoa(binary);
}

/**
 * Write CSV content to `uri` as UTF8. Caller handles cleanup via
 * `FileSystem.deleteAsync(uri, { idempotent: true })` after share.
 */
async function writeCsvFile(uri: string, content: string): Promise<string> {
  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return uri;
}

/**
 * Export inventory rows to .xlsx (or CSV fallback).
 *
 * @param rows - already-cached inventory rows (no DB fetch). May be 10k+.
 * @returns file uri in `FileSystem.cacheDirectory` — caller deletes after `Sharing.shareAsync`.
 *
 * Batching: 1000-row chunks, `setImmediate` yield every 5k rows when `rows.length > 5000`
 * to avoid OOM/freeze on low-end Android. `writeBuffer` byteLength >0 asserted in tests.
 * On any workbook error we fall back to CSV (BOM + RFC4180) so export never hard-fails
 * due to Metro polyfill issues. File cleanup is caller's responsibility (idempotent delete).
 * No network required; works offline.
 */
export async function exportInventory(
  rows: InventoryExportRow[],
): Promise<string> {
  const date = getDateString();
  const filename = `elvira-inventory-${date}.xlsx`;
  const uri = getCacheDirectory() + filename;
  const csvFallbackUri = uri.replace(/\.xlsx$/, '.csv');

  if (!ExcelJS) {
    const csv = buildInventoryCsv(rows);
    return writeCsvFile(csvFallbackUri, csv);
  }

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Elvira POS';
    const ws = wb.addWorksheet('Inventory');
    ws.columns = [
      { header: 'product_id', key: 'product_id', width: 12 },
      { header: 'name', key: 'name', width: 28 },
      { header: 'category', key: 'category', width: 16 },
      {
        header: 'price',
        key: 'price',
        width: 10,
        style: { numFmt: '#,##0.00' },
      },
      { header: 'quantity', key: 'quantity', width: 10 },
      { header: 'reorder_level', key: 'reorder_level', width: 14 },
      { header: 'status', key: 'status', width: 10 },
      {
        header: 'stock_value',
        key: 'stock_value',
        width: 12,
        style: { numFmt: '#,##0.00' },
      },
      { header: 'supplier', key: 'supplier', width: 18 },
    ];
    // freeze header + filter for UX
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    // autoFilter expects cell range
    ws.autoFilter = { from: 'A1', to: 'I1' };

    const CHUNK_SIZE = 1000;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      for (const r of chunk) {
        ws.addRow(r);
      }
      // Yield every ~5k rows to avoid freezing low-end Android JS thread
      if (rows.length > 5000 && (i + CHUNK_SIZE) % 5000 === 0) {
        await new Promise<void>((resolve) => {
          const maybeSetImmediate = (
            globalThis as unknown as { setImmediate?: (cb: () => void) => void }
          ).setImmediate;
          if (maybeSetImmediate) maybeSetImmediate(() => resolve());
          else setTimeout(() => resolve(), 0);
        });
      }
    }

    ws.getRow(1).font = { bold: true };
    ws.getRow(1).commit();

    const buf = (await wb.xlsx.writeBuffer()) as ArrayBuffer | Uint8Array;
    const base64 = arrayBufferToBase64(buf);
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
  } catch {
    // Any workbook failure falls back to CSV (e.g. Metro missing polyfill)
    const csv = buildInventoryCsv(rows);
    return writeCsvFile(csvFallbackUri, csv);
  }
}

/**
 * Export transactions to .xlsx (or CSV fallback) with date-range aware filename.
 *
 * @param rows - filtered transaction rows for the selected range (may be 0).
 * @param rangeLabel - `daily`/`weekly`/`monthly` or `2026-08-30_to_2026-08-31`; sanitized to `[a-zA-Z0-9-_]` else `all`.
 * @returns file uri — caller deletes after share (idempotent).
 *
 * Same batching/BOM/cleanup guarantees as `exportInventory`. Empty `rows` still
 * emits header (not error). `date` kept as ISO text to avoid Excel date-shift.
 * No PII: only `cashier` username (already visible in Reports).
 */
export async function exportTransactions(
  rows: TransactionExportRow[],
  rangeLabel: string,
): Promise<string> {
  const date = getDateString();
  const safeRange = rangeLabel.replace(/[^a-zA-Z0-9-_]/g, '_') || 'all';
  const filename = `elvira-transactions-${safeRange}-${date}.xlsx`;
  const uri = getCacheDirectory() + filename;
  const csvFallbackUri = uri.replace(/\.xlsx$/, '.csv');

  if (!ExcelJS) {
    const csv = buildTransactionsCsv(rows);
    return writeCsvFile(csvFallbackUri, csv);
  }

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Elvira POS';
    const ws = wb.addWorksheet('Transactions');
    ws.columns = [
      { header: 'order_number', key: 'order_number', width: 14 },
      { header: 'transaction_id', key: 'transaction_id', width: 20 },
      { header: 'date', key: 'date', width: 20 },
      { header: 'items_summary', key: 'items_summary', width: 36 },
      { header: 'payment_mode', key: 'payment_mode', width: 12 },
      {
        header: 'total_amount',
        key: 'total_amount',
        width: 14,
        style: { numFmt: '#,##0.00' },
      },
      { header: 'status', key: 'status', width: 12 },
      { header: 'cashier', key: 'cashier', width: 16 },
    ];
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: 'A1', to: 'H1' };

    const CHUNK_SIZE = 1000;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      for (const r of chunk) ws.addRow(r);
      if (rows.length > 5000 && (i + CHUNK_SIZE) % 5000 === 0) {
        await new Promise<void>((resolve) => {
          const maybeSetImmediate = (
            globalThis as unknown as { setImmediate?: (cb: () => void) => void }
          ).setImmediate;
          if (maybeSetImmediate) maybeSetImmediate(() => resolve());
          else setTimeout(() => resolve(), 0);
        });
      }
    }

    ws.getRow(1).font = { bold: true };
    ws.getRow(1).commit();

    const buf = (await wb.xlsx.writeBuffer()) as ArrayBuffer | Uint8Array;
    const base64 = arrayBufferToBase64(buf);
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return uri;
  } catch {
    const csv = buildTransactionsCsv(rows);
    return writeCsvFile(csvFallbackUri, csv);
  }
}

/**
 * Share `uri` via OS sheet. Throws if `Sharing.isAvailableAsync() === false`
 * (caller shows `Alert`); `FileSystem.writeAsStringAsync` failures propagate to
 * caller for `Alert` handling. Always `deleteAsync` after share (idempotent).
 */
export async function shareExportedFile(uri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing not available');
  }
  await Sharing.shareAsync(uri, {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
