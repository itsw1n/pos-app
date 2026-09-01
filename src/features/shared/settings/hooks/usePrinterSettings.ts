import { useCallback, useEffect, useState } from 'react';
import {
  connectPrinter,
  printThermalTest,
  scanBluetoothPrinters,
  ThermalDevice,
  WIFI_DEFAULT_PORT,
} from '@/services/printerService';
import {
  clearPrinterConfig,
  getPrinterConfig,
  PrinterConfig,
  setPrinterConfig,
} from '@/services/printerStorage';

export type PrinterConnectionType = 'bluetooth' | 'wifi';

export interface UsePrinterSettingsResult {
  connectionType: PrinterConnectionType;
  devices: ThermalDevice[];
  isConnecting: boolean;
  isError: boolean;
  isScanning: boolean;
  isTestPrinting: boolean;
  savedConfig: PrinterConfig | null;
  status: string;
  wifiHost: string;
  wifiPort: string;
  connectBluetooth: (device: ThermalDevice) => Promise<void>;
  connectWifi: () => Promise<void>;
  disconnect: () => Promise<void>;
  scan: () => Promise<void>;
  selectConnectionType: (type: PrinterConnectionType) => void;
  setWifiHost: (value: string) => void;
  setWifiPort: (value: string) => void;
  testPrint: () => Promise<void>;
}

export function usePrinterSettings(): UsePrinterSettingsResult {
  const [connectionType, setConnectionType] =
    useState<PrinterConnectionType>('bluetooth');
  const [devices, setDevices] = useState<ThermalDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [savedConfig, setSavedConfig] = useState<PrinterConfig | null>(null);
  const [wifiHost, setWifiHost] = useState('');
  const [wifiPort, setWifiPort] = useState(String(WIFI_DEFAULT_PORT));
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  const setStatusMessage = (message: string, error = false): void => {
    setStatus(message);
    setIsError(error);
  };

  const loadSaved = useCallback(async (): Promise<void> => {
    const config = await getPrinterConfig();
    setSavedConfig(config);
    if (config?.type === 'wifi') {
      const [host = ''] = config.address.split(':');
      setWifiHost(host);
      setWifiPort(String(config.port ?? WIFI_DEFAULT_PORT));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial persisted printer config load
    void loadSaved();
  }, [loadSaved]);

  const scan = async (): Promise<void> => {
    if (isScanning) return;
    setIsScanning(true);
    setStatusMessage('Scanning for Bluetooth printers...');
    setDevices([]);
    try {
      const found = await scanBluetoothPrinters();
      setDevices(found);
      setStatusMessage(
        found.length > 0
          ? `${found.length} printer(s) found`
          : 'No printers found. Keep the printer discoverable and try again.',
        found.length === 0,
      );
    } catch {
      setStatusMessage('Bluetooth scanning failed', true);
    } finally {
      setIsScanning(false);
    }
  };

  const connectBluetooth = async (device: ThermalDevice): Promise<void> => {
    if (isConnecting) return;
    setIsConnecting(true);
    setStatusMessage(`Connecting to ${device.name}...`);
    const config: PrinterConfig = {
      type: 'bluetooth',
      address: device.address,
      name: device.name,
      deviceType: device.deviceType,
    };
    try {
      await connectPrinter(config);
      await setPrinterConfig(config);
      setSavedConfig(config);
      setStatusMessage(`Connected to ${device.name}`);
    } catch {
      setStatusMessage(`Could not connect to ${device.name}`, true);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWifi = async (): Promise<void> => {
    const host = wifiHost.trim();
    const port = wifiPort.trim() === '' ? WIFI_DEFAULT_PORT : Number(wifiPort);
    if (!host) {
      setStatusMessage('Enter the printer IP address', true);
      return;
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setStatusMessage('Enter a valid port (1-65535)', true);
      return;
    }
    if (isConnecting) return;
    setIsConnecting(true);
    setStatusMessage('Connecting to WiFi printer...');
    const config: PrinterConfig = {
      type: 'wifi',
      address: host,
      port,
      name: `${host}:${port}`,
    };
    try {
      await connectPrinter(config);
      await setPrinterConfig(config);
      setSavedConfig(config);
      setStatusMessage(`Connected to ${host}:${port}`);
    } catch {
      setStatusMessage(`Could not connect to ${host}:${port}`, true);
    } finally {
      setIsConnecting(false);
    }
  };

  const testPrint = async (): Promise<void> => {
    const config = savedConfig ?? (await getPrinterConfig());
    if (!config) {
      setStatusMessage('Connect a printer before running a test print', true);
      return;
    }
    setIsTestPrinting(true);
    try {
      await printThermalTest(config);
      setStatusMessage('Test print sent to the printer');
    } catch {
      setStatusMessage(
        'Test print failed — check the printer connection',
        true,
      );
    } finally {
      setIsTestPrinting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    await clearPrinterConfig();
    setSavedConfig(null);
    setStatusMessage('Printer disconnected');
  };

  return {
    connectionType,
    devices,
    isConnecting,
    isError,
    isScanning,
    isTestPrinting,
    savedConfig,
    status,
    wifiHost,
    wifiPort,
    connectBluetooth,
    connectWifi,
    disconnect,
    scan,
    selectConnectionType: setConnectionType,
    setWifiHost,
    setWifiPort,
    testPrint,
  };
}
