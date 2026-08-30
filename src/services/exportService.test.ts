import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// eslint-disable-next-line import/first
import {
  escapeCsvValue,
  buildInventoryCsv,
  buildTransactionsCsv,
} from './exportService';

describe('exportInventory CSV fallback', () => {
  it('escapes commas and quotes', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"');
    expect(escapeCsvValue('a"b')).toBe('"a""b"');
    expect(escapeCsvValue('a"b, c\nd')).toBe('"a""b, c\nd"');
    expect(escapeCsvValue('simple')).toBe('simple');
    // header quoting via buildInventoryCsv with tricky name
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
    // BOM + header + quoted field
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"a""b, c\nd"');
    expect(csv.split('\n')[0].replace(/^\ufeff/, '')).toBe(
      'product_id,name,category,price,quantity,reorder_level,status,stock_value,supplier',
    );
  });

  it('filename contains date', async () => {
    // Use the mocked exceljs + file-system path — should return xlsx uri with date
    const { exportInventory } = await import('./exportService');
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
  });

  it('empty rows still produce header with BOM', () => {
    const csv = buildInventoryCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toBe(
      '\ufeffproduct_id,name,category,price,quantity,reorder_level,status,stock_value,supplier',
    );
  });
});

describe('exportTransactions CSV helpers', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('buildTransactionsCsv escapes and includes BOM', () => {
    const csv = buildTransactionsCsv([
      {
        order_number: 1,
        transaction_id: 'tx-1',
        date: '2026-08-30T00:00:00.000Z',
        items_summary: '2x Coffee, 1x Tea',
        payment_mode: 'cash',
        total_amount: 123.45,
        status: 'completed',
        cashier: 'cashier@elvira.cafe',
      },
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"2x Coffee, 1x Tea"');
  });
});
