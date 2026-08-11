import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Button } from '@/components/common/Button/Button';
import { InputField } from '@/components/common/InputField/InputField';
import {
  connectPrinter,
  printThermalTest,
  scanBluetoothPrinters,
  ThermalDevice,
  WIFI_DEFAULT_PORT,
} from '@/services/printerService';
import {
  getPrinterConfig,
  setPrinterConfig as savePrinterConfig,
  clearPrinterConfig,
  PrinterConfig,
} from '@/services/printerStorage';
import { colors } from '@/theme';
import { printerSettingsStyles } from './PrinterSettings.styles';

type PrinterSettingsProps = {
  style?: StyleProp<ViewStyle>;
};

export type PrinterConnectionType = 'bluetooth' | 'wifi';

export function PrinterSettings({
  style,
}: PrinterSettingsProps): React.JSX.Element {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial device config load
    void loadSaved();
  }, [loadSaved]);

  const setStatusMessage = (message: string, error = false): void => {
    setStatus(message);
    setIsError(error);
  };

  const handleScan = async (): Promise<void> => {
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

  const handleConnectBluetooth = async (
    device: ThermalDevice,
  ): Promise<void> => {
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
      await savePrinterConfig(config);
      setSavedConfig(config);
      setStatusMessage(`Connected to ${device.name}`);
    } catch {
      setStatusMessage(`Could not connect to ${device.name}`, true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectWifi = async (): Promise<void> => {
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
      await savePrinterConfig(config);
      setSavedConfig(config);
      setStatusMessage(`Connected to ${host}:${port}`);
    } catch {
      setStatusMessage(`Could not connect to ${host}:${port}`, true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestPrint = async (): Promise<void> => {
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

  const handleDisconnect = async (): Promise<void> => {
    await clearPrinterConfig();
    setSavedConfig(null);
    setStatusMessage('Printer disconnected');
  };

  const selectConnectionType = (type: PrinterConnectionType): void => {
    setConnectionType(type);
  };

  const isConnected = savedConfig != null;

  return (
    <ScrollView
      style={[printerSettingsStyles.container, style]}
      contentContainerStyle={printerSettingsStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={printerSettingsStyles.card}>
        <Text style={printerSettingsStyles.cardTitle}>Connection Type</Text>
        <Text style={printerSettingsStyles.cardCaption}>
          Choose how this device reaches the receipt printer.
        </Text>
        <View style={printerSettingsStyles.toggleRow}>
          <Pressable
            style={[
              printerSettingsStyles.toggleOption,
              printerSettingsStyles.toggleOptionLeft,
              connectionType === 'bluetooth'
                ? printerSettingsStyles.toggleOptionActive
                : null,
            ]}
            onPress={() => selectConnectionType('bluetooth')}
          >
            <Text
              style={[
                printerSettingsStyles.toggleOptionText,
                connectionType === 'bluetooth'
                  ? printerSettingsStyles.toggleOptionTextActive
                  : null,
              ]}
            >
              Bluetooth
            </Text>
          </Pressable>
          <Pressable
            style={[
              printerSettingsStyles.toggleOption,
              printerSettingsStyles.toggleOptionRight,
              connectionType === 'wifi'
                ? printerSettingsStyles.toggleOptionActive
                : null,
            ]}
            onPress={() => selectConnectionType('wifi')}
          >
            <Text
              style={[
                printerSettingsStyles.toggleOptionText,
                connectionType === 'wifi'
                  ? printerSettingsStyles.toggleOptionTextActive
                  : null,
              ]}
            >
              WiFi
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={printerSettingsStyles.card}>
        <Text style={printerSettingsStyles.cardTitle}>
          {connectionType === 'bluetooth'
            ? 'Pair a Bluetooth Printer'
            : 'Connect a WiFi Printer'}
        </Text>
        <Text style={printerSettingsStyles.cardCaption}>
          {connectionType === 'bluetooth'
            ? 'Keep the printer discoverable, then scan for nearby devices.'
            : 'Enter the printer IP address shown on its network settings.'}
        </Text>

        {connectionType === 'wifi' ? (
          <View style={printerSettingsStyles.wifiFields}>
            <View style={printerSettingsStyles.wifiHostField}>
              <InputField
                label="Printer IP"
                value={wifiHost}
                onChangeText={setWifiHost}
                placeholder="192.168.1.100"
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <InputField
              label="Port"
              value={wifiPort}
              onChangeText={setWifiPort}
              placeholder="9100"
              keyboardType="number-pad"
            />
          </View>
        ) : null}

        <View style={printerSettingsStyles.deviceRow}>
          <View style={printerSettingsStyles.deviceInfo}>
            <Text style={printerSettingsStyles.deviceName}>
              {savedConfig?.name ??
                (isConnected ? 'Printer connected' : 'No printer configured')}
            </Text>
            {savedConfig ? (
              <Text style={printerSettingsStyles.deviceStatus}>
                {savedConfig.type === 'bluetooth'
                  ? `Bluetooth · ${savedConfig.address}`
                  : `WiFi · ${savedConfig.address}:${savedConfig.port}`}
              </Text>
            ) : null}
          </View>
          {isConnected ? (
            <Button variant="danger" size="small" onPress={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button
              variant="primary"
              size="small"
              disabled={
                isConnecting || (connectionType === 'bluetooth' && isScanning)
              }
              onPress={
                connectionType === 'wifi' ? handleConnectWifi : handleScan
              }
            >
              {isConnecting
                ? 'Connecting...'
                : connectionType === 'bluetooth'
                  ? isScanning
                    ? 'Scanning...'
                    : 'Scan & Pair'
                  : 'Connect'}
            </Button>
          )}
        </View>

        {connectionType === 'bluetooth' && devices.length > 0 ? (
          <View style={printerSettingsStyles.deviceList}>
            {devices.map((device, index) => (
              <Pressable
                key={`${device.address}-${index}`}
                style={[
                  printerSettingsStyles.deviceItem,
                  savedConfig?.address === device.address
                    ? printerSettingsStyles.deviceItemActive
                    : null,
                ]}
                onPress={() => handleConnectBluetooth(device)}
              >
                <View style={printerSettingsStyles.deviceInfo}>
                  <Text style={printerSettingsStyles.deviceName}>
                    {device.name}
                  </Text>
                  <Text style={printerSettingsStyles.deviceStatus}>
                    {device.address} ·{' '}
                    {device.deviceType === 'ble'
                      ? 'BLE'
                      : device.deviceType === 'bt'
                        ? 'Classic'
                        : 'Bluetooth'}
                  </Text>
                </View>
                {isConnecting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Button
        variant="outline"
        size="large"
        onPress={handleTestPrint}
        disabled={isTestPrinting || isConnecting}
        style={printerSettingsStyles.testButton}
      >
        {isTestPrinting ? 'Printing...' : 'Test Print'}
      </Button>

      {Platform.OS !== 'web' ? (
        <Text style={printerSettingsStyles.webNote}>
          Test Print sends an ESC/POS test page to the connected thermal
          printer.
        </Text>
      ) : null}

      {status ? (
        <View
          style={[
            printerSettingsStyles.statusBanner,
            !isError && !status.includes('failed')
              ? printerSettingsStyles.statusBannerSuccess
              : null,
          ]}
        >
          <Text style={printerSettingsStyles.statusText}>{status}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
