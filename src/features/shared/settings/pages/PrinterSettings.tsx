import React from 'react';
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
import { usePrinterSettings } from '@/features/shared/settings/hooks/usePrinterSettings';
import { colors } from '@/theme';
import { printerSettingsStyles } from './PrinterSettings.styles';

type PrinterSettingsProps = {
  style?: StyleProp<ViewStyle>;
};

export function PrinterSettings({
  style,
}: PrinterSettingsProps): React.JSX.Element {
  const {
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
    selectConnectionType,
    setWifiHost,
    setWifiPort,
    testPrint,
  } = usePrinterSettings();
  const isConnected = savedConfig !== null;

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
            <Button
              variant="danger"
              size="small"
              onPress={() => void disconnect()}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="primary"
              size="small"
              disabled={
                isConnecting || (connectionType === 'bluetooth' && isScanning)
              }
              onPress={() => {
                if (connectionType === 'wifi') {
                  void connectWifi();
                } else {
                  void scan();
                }
              }}
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
            {devices.map((device) => (
              <Pressable
                key={`${device.deviceType}-${device.address}`}
                style={[
                  printerSettingsStyles.deviceItem,
                  savedConfig?.address === device.address
                    ? printerSettingsStyles.deviceItemActive
                    : null,
                ]}
                onPress={() => void connectBluetooth(device)}
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
        onPress={() => void testPrint()}
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
            !isError ? printerSettingsStyles.statusBannerSuccess : null,
          ]}
        >
          <Text style={printerSettingsStyles.statusText}>{status}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
