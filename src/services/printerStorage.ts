import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Device } from 'react-native-thermal-printer-driver';

const STORAGE_KEY = 'printer_config';

export interface PrinterConfig {
  type: 'bluetooth' | 'wifi';
  address: string;
  name?: string;
  deviceType?: Device['deviceType'];
  /** WiFi printers only. */
  port?: number;
}

function normalize(raw: string | null): PrinterConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PrinterConfig>;
    if (parsed.type !== 'bluetooth' && parsed.type !== 'wifi') return null;
    if (!parsed.address) return null;
    return parsed as PrinterConfig;
  } catch {
    return null;
  }
}

export async function getPrinterConfig(): Promise<PrinterConfig | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return normalize(raw);
}

export async function setPrinterConfig(config: PrinterConfig): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function clearPrinterConfig(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
