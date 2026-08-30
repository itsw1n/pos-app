import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  escapeCsvValue,
  buildInventoryCsv,
  buildTransactionsCsv,
  exportInventory,
  exportTransactions,
  shareExportedFile,
} from './exportService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

vi.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  documentDirectory: 'file:///doc/',
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
  writeAsStringAsync: vi.fn(async () => {}),
  deleteAsync: vi.fn(async () => {}),
}));

vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn(async () => true),
  shareAsync: vi.fn(async () => {}),
}));

vi.mock('exceljs', () => {
  class MockWorkbook {
    creator = '';
    xlsx = {
      writeBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    };
    addWorksheet(): unknown {
      return {
        columns: [] as unknown[],
        views: [] as unknown[],
        autoFilter: null as unknown,
        addRow: vi.fn(),
        getRow: () => ({ font: {}, commit: vi.fn() }),
      };
    }
  }
  return { Workbook: MockWorkbook };
});

const mockedWrite = vi.mocked(FileSystem.writeAsStringAsync);
const mockedDelete = vi.mocked(FileSystem.deleteAsync);
const mockedIsAvailable = vi.mocked(Sharing.isAvailableAsync);
const mockedShare = vi.mocked(Sharing.shareAsync);

beforeEach(() => {
  vi.clearAllMocks();
  mockedIsAvailable.mockResolvedValue(true);
  mockedWrite.mockResolvedValue(undefined);
  mockedDelete.mockResolvedValue(undefined);
});

describe('escapeCsvValue — RFC4180', () => {
  it('wraps commas', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"');
  });

  it('escapes quotes', () => {
    expect(escapeCsvValue('a"b')).toBe('"a""b"');
  });

  it('wraps and escapes a"b, c\\nd', () => {
    expect(escapeCsvValue('a"b, c\nd')).toBe('"a""b, c\nd"');
  });

  it('wraps fields with CRLF', () => {
    expect(escapeCsvValue('line1\r\nline2')).toBe('"line1\r\nline2"');
    expect(escapeCsvValue('a\rb')).toBe('"a\rb"');
  });

  it('leaves simple strings unwrapped', () => {
    expect(escapeCsvValue('simple')).toBe('simple');
    expect(escapeCsvValue('')).toBe('');
    expect(escapeCsvValue('123')).toBe('123');
  });

  it('handles multiple quotes', () => {
    expect(escapeCsvValue('""')).toBe('""""""');
    expect(escapeCsvValue('a""b')).toBe('"a""""b"');
  });
});

describe('buildInventoryCsv', () => {
  it('BOM + header correct', () => {
    const csv = buildInventoryCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toBe(
      '\ufeffproduct_id,name,category,price,quantity,reorder_level,status,stock_value,supplier',
    );
  });

  it('escapes commas and quotes with BOM', () => {
    const csv = buildInventoryCsv([
      {
        product_id: 1,
        name: 'a"b, c\nd',
        category: 'Cat',
        price: 10,
        quantity: 5,
        reorder_level: 2,
        status: 'ok',
        stock_value: 50,
        supplier: null,
      },
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"a""b, c\nd"');
    expect(csv.split('\n')[0].replace(/^\ufeff/, '')).toBe(
      'product_id,name,category,price,quantity,reorder_level,status,stock_value,supplier',
    );
  });

  it('handles supplier null and empty', () => {
    const csv = buildInventoryCsv([
      {
        product_id: 2,
        name: 'Latte',
        category: 'Coffee',
        price: 120.5,
        quantity: 0,
        reorder_level: 5,
        status: 'critical',
        stock_value: 0,
        supplier: null,
      },
    ]);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('2,Latte,Coffee,120.5,0,5,critical,0,');
  });

  it('escapes supplier with special chars', () => {
    const csv = buildInventoryCsv([
      {
        product_id: 3,
        name: 'Tea',
        category: 'Tea',
        price: 50,
        quantity: 3,
        reorder_level: 2,
        status: 'ok',
        stock_value: 150,
        supplier: 'Acme, "Ltd"\nCo.',
      },
    ]);
    expect(csv).toContain('"Acme, ""Ltd""\nCo."');
  });

  it('no PII — headers contain no email/password', () => {
    const csv = buildInventoryCsv([]);
    const header = csv.replace(/^\ufeff/, '').split('\n')[0];
    expect(header).not.toContain('email');
    expect(header).not.toContain('password');
    expect(header).not.toContain('user');
    expect(header.split(',')).toEqual([
      'product_id',
      'name',
      'category',
      'price',
      'quantity',
      'reorder_level',
      'status',
      'stock_value',
      'supplier',
    ]);
  });

  it('line count equals rows + header', () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      product_id: i,
      name: `P${i}`,
      category: 'Cat',
      price: 10,
      quantity: 1,
      reorder_level: 2,
      status: 'ok' as const,
      stock_value: 10,
      supplier: null,
    }));
    const csv = buildInventoryCsv(rows);
    expect(csv.split('\n')).toHaveLength(6);
  });
});

describe('buildTransactionsCsv', () => {
  it('BOM + escapes items_summary comma', () => {
    const csv = buildTransactionsCsv([
      {
        order_number: 1,
        transaction_id: 'tx-1',
        date: '2026-08-30T00:00:00.000Z',
        items_summary: '2x Coffee, 1x Tea',
        payment_mode: 'cash',
        total_amount: 123.45,
        status: 'completed',
        cashier: 'cashier1',
      },
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"2x Coffee, 1x Tea"');
  });

  it('header correct with BOM and no PII', () => {
    const csv = buildTransactionsCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toBe(
      '\ufefforder_number,transaction_id,date,items_summary,payment_mode,total_amount,status,cashier',
    );
    const header = csv.replace(/^\ufeff/, '');
    expect(header).not.toContain('email');
    expect(header).not.toContain('password');
  });

  it('empty rows still produce header', () => {
    const csv = buildTransactionsCsv([]);
    expect(csv.split('\n')).toHaveLength(1);
  });

  it('null order_number becomes empty cell', () => {
    const csv = buildTransactionsCsv([
      {
        order_number: null,
        transaction_id: 'tx-2',
        date: '2026-08-30T12:00:00.000Z',
        items_summary: '1x Latte',
        payment_mode: 'gcash',
        total_amount: 80,
        status: 'completed',
        cashier: 'admin',
      },
    ]);
    const line = csv.split('\n')[1];
    expect(line.startsWith(',tx-2')).toBe(true);
  });

  it('cashier username only — no email leaked beyond provided value', () => {
    const csv = buildTransactionsCsv([
      {
        order_number: 1,
        transaction_id: 'tx-1',
        date: '2026-08-30T00:00:00.000Z',
        items_summary: '1x Coffee',
        payment_mode: 'cash',
        total_amount: 100,
        status: 'completed',
        cashier: 'cashier1',
      },
    ]);
    // cashier is username, not email — header is `cashier`, not `cashier_email`
    expect(csv).toContain('cashier1');
    expect(csv).not.toContain('cashier_email');
  });

  it('items_summary without comma is not quoted', () => {
    const csv = buildTransactionsCsv([
      {
        order_number: 2,
        transaction_id: 'tx-2',
        date: '2026-08-30T12:00:00.000Z',
        items_summary: '1x Latte',
        payment_mode: 'maya',
        total_amount: 80,
        status: 'completed',
        cashier: 'admin',
      },
    ]);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('1x Latte');
    expect(lines[1]).not.toContain('"1x Latte"');
  });
});

describe('exportInventory — workbook + fallback', () => {
  it('filename contains date and elvira-inventory-', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const uri = await exportInventory([
      {
        product_id: 1,
        name: 'P1',
        category: 'Cat',
        price: 10,
        quantity: 2,
        reorder_level: 5,
        status: 'low',
        stock_value: 20,
        supplier: 'Acme',
      },
    ]);
    expect(uri).toContain(date);
    expect(uri).toContain('elvira-inventory-');
    expect(uri).toMatch(/\.x?lsx|\.csv$/);
    expect(mockedWrite).toHaveBeenCalledTimes(1);
    // writeBuffer mock returns 3 bytes → base64 non-empty
    const firstCallArg = mockedWrite.mock.calls[0][1] as string;
    expect(firstCallArg.length).toBeGreaterThan(0);
  });

  it('empty rows still returns header file', async () => {
    const uri = await exportInventory([]);
    expect(uri).toContain('elvira-inventory-');
    expect(mockedWrite).toHaveBeenCalled();
  });

  it('inventory 10k rows does not throw, byteLength>0, filename correct', async () => {
    const rows = Array.from({ length: 10000 }, (_, i) => ({
      product_id: i,
      name: `P${i}`,
      category: 'Cat',
      price: 10,
      quantity: 5,
      reorder_level: 2,
      status: 'ok' as const,
      stock_value: 50,
      supplier: i % 2 === 0 ? 'Acme' : null,
    }));
    const date = new Date().toISOString().slice(0, 10);
    const uri = await exportInventory(rows);
    expect(uri).toContain('elvira-inventory-');
    expect(uri).toContain(date);
    expect(uri).toMatch(/\.x?lsx|\.csv$/);
    expect(mockedWrite).toHaveBeenCalled();
    // mocked writeBuffer is 3 bytes → base64 `AQID` length 4
    const written = mockedWrite.mock.calls[0][1] as string;
    // base64 of [1,2,3] is AQID
    expect(written.length).toBeGreaterThan(0);
    // cleanup idempotent — call delete as UI would
    await FileSystem.deleteAsync(uri, { idempotent: true });
    expect(mockedDelete).toHaveBeenCalledWith(uri, { idempotent: true });
  });

  it('CSV escapes correctly via fallback when workbook write fails', async () => {
    // Force workbook path to fail by making first writeAsStringAsync throw,
    // fallback should write CSV with BOM and quoted field
    mockedWrite
      .mockRejectedValueOnce(new Error('disk full'))
      .mockResolvedValueOnce(undefined);
    const uri = await exportInventory([
      {
        product_id: 1,
        name: 'a"b, c\nd',
        category: 'Cat',
        price: 10,
        quantity: 5,
        reorder_level: 2,
        status: 'ok',
        stock_value: 50,
        supplier: null,
      },
    ]);
    // fallback uri is .csv
    expect(uri).toContain('.csv');
    expect(uri).toContain('elvira-inventory-');
    expect(mockedWrite).toHaveBeenCalledTimes(2);
    const csvContent = mockedWrite.mock.calls[1][1] as string;
    expect(csvContent.charCodeAt(0)).toBe(0xfeff);
    expect(csvContent).toContain('"a""b, c\nd"');
  });

  it('throws if both workbook and CSV writes fail', async () => {
    mockedWrite.mockRejectedValue(new Error('disk full'));
    await expect(
      exportInventory([
        {
          product_id: 1,
          name: 'P1',
          category: 'Cat',
          price: 10,
          quantity: 1,
          reorder_level: 2,
          status: 'ok',
          stock_value: 10,
        },
      ]),
    ).rejects.toThrow('disk full');
  });

  it('CSV fallback write uses UTF8 encoding', async () => {
    mockedWrite
      .mockRejectedValueOnce(new Error('workbook fail'))
      .mockImplementationOnce(
        async (uri: string, content: string, opts: unknown) => {
          const o = opts as { encoding: string };
          expect(o.encoding).toBe('utf8');
          expect(content.charCodeAt(0)).toBe(0xfeff);
        },
      );
    const uri = await exportInventory([
      {
        product_id: 1,
        name: 'P1',
        category: 'Cat',
        price: 10,
        quantity: 1,
        reorder_level: 2,
        status: 'ok',
        stock_value: 10,
      },
    ]);
    expect(uri).toContain('.csv');
  });
});

describe('exportTransactions — workbook + fallback', () => {
  it('transactions filename includes range and date', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const uri = await exportTransactions(
      [
        {
          order_number: 1,
          transaction_id: 'tx-1',
          date: '2026-08-30T00:00:00.000Z',
          items_summary: '2x Coffee, 1x Tea',
          payment_mode: 'cash',
          total_amount: 100,
          status: 'completed',
          cashier: 'cashier',
        },
      ],
      'weekly',
    );
    expect(uri).toContain('elvira-transactions-weekly-');
    expect(uri).toContain(date);
    expect(uri).toMatch(/\.x?lsx|\.csv$/);
  });

  it('sanitizes rangeLabel', async () => {
    const uri = await exportTransactions([], '2026/08/30 - 2026/08/31');
    expect(uri).toContain('elvira-transactions-2026_08_30_-_2026_08_31-');
  });

  it('empty rows still produce header file', async () => {
    const uri = await exportTransactions([], 'all');
    expect(uri).toContain('elvira-transactions-all-');
    expect(mockedWrite).toHaveBeenCalled();
  });

  it('10k transactions does not throw', async () => {
    const rows = Array.from({ length: 10000 }, (_, i) => ({
      order_number: i,
      transaction_id: `tx-${i}`,
      date: '2026-08-30T00:00:00.000Z',
      items_summary: i % 2 === 0 ? '2x Coffee, 1x Tea' : '1x Latte',
      payment_mode: 'cash',
      total_amount: 100 + i,
      status: 'completed',
      cashier: 'cashier1',
    }));
    const uri = await exportTransactions(rows, 'monthly');
    expect(uri).toContain('elvira-transactions-monthly-');
    expect(mockedWrite).toHaveBeenCalled();
    const written = mockedWrite.mock.calls[0][1] as string;
    expect(written.length).toBeGreaterThan(0);
    await FileSystem.deleteAsync(uri, { idempotent: true });
    expect(mockedDelete).toHaveBeenCalled();
  });

  it('fallback to CSV when workbook write fails', async () => {
    mockedWrite
      .mockRejectedValueOnce(new Error('workbook fail'))
      .mockResolvedValueOnce(undefined);
    const uri = await exportTransactions(
      [
        {
          order_number: 1,
          transaction_id: 'tx-1',
          date: '2026-08-30T00:00:00.000Z',
          items_summary: 'a"b, c\nd',
          payment_mode: 'cash',
          total_amount: 50,
          status: 'completed',
          cashier: 'cashier1',
        },
      ],
      'daily',
    );
    expect(uri).toContain('.csv');
    const csvContent = mockedWrite.mock.calls[1][1] as string;
    expect(csvContent).toContain('"a""b, c\nd"');
    expect(csvContent.charCodeAt(0)).toBe(0xfeff);
  });

  it('throws if both workbook and CSV writes fail', async () => {
    mockedWrite.mockRejectedValue(new Error('io fail'));
    await expect(exportTransactions([], 'all')).rejects.toThrow('io fail');
  });
});

describe('shareExportedFile — error paths', () => {
  it('throws when Sharing not available', async () => {
    mockedIsAvailable.mockResolvedValue(false);
    await expect(
      shareExportedFile('file:///cache/elvira-inventory-2026-08-30.xlsx'),
    ).rejects.toThrow('Sharing not available');
    expect(mockedShare).not.toHaveBeenCalled();
  });

  it('calls shareAsync with correct mime when available', async () => {
    mockedIsAvailable.mockResolvedValue(true);
    await shareExportedFile('file:///cache/elvira-inventory-2026-08-30.xlsx');
    expect(mockedShare).toHaveBeenCalledWith(
      'file:///cache/elvira-inventory-2026-08-30.xlsx',
      {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    );
  });

  it('FileSystem.writeAsStringAsync failure propagates (UI shows Alert)', async () => {
    mockedWrite.mockRejectedValue(new Error('ENOSPC'));
    // both paths will fail → export should reject so UI can Alert
    await expect(
      exportInventory([
        {
          product_id: 1,
          name: 'P1',
          category: 'Cat',
          price: 10,
          quantity: 1,
          reorder_level: 2,
          status: 'ok',
          stock_value: 10,
        },
      ]),
    ).rejects.toThrow('ENOSPC');
  });
});

describe('no PII', () => {
  it('inventory export contains no email/password columns', () => {
    const csv = buildInventoryCsv([
      {
        product_id: 1,
        name: 'P1',
        category: 'Cat',
        price: 10,
        quantity: 1,
        reorder_level: 2,
        status: 'ok',
        stock_value: 10,
      },
    ]);
    expect(csv.toLowerCase()).not.toContain('email');
    expect(csv.toLowerCase()).not.toContain('password');
  });

  it('transactions export contains cashier username only', () => {
    const csv = buildTransactionsCsv([
      {
        order_number: 1,
        transaction_id: 'tx-1',
        date: '2026-08-30T00:00:00.000Z',
        items_summary: '1x Coffee',
        payment_mode: 'cash',
        total_amount: 100,
        status: 'completed',
        cashier: 'cashier1',
      },
    ]);
    expect(csv).toContain('cashier1');
    // header is `cashier`, not `cashier_email` or `user_email`
    expect(buildTransactionsCsv([])).not.toContain('email');
  });
});
