import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Button } from '@/components/common/Button/Button';
import { printReceipt } from '@/services/printerService';
import { printerSettingsStyles } from './PrinterSettings.styles';

type PrinterSettingsProps = {
  style?: StyleProp<ViewStyle>;
};

export type PrinterConnectionType = 'bluetooth' | 'wifi';

export function PrinterSettings({ style }: PrinterSettingsProps): React.JSX.Element {
  const [connectionType, setConnectionType] = useState<PrinterConnectionType>('bluetooth');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('');

  const handleConnect = (): void => {
    if (isConnecting) return;
    setIsConnecting(true);
    setStatus('');
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setStatus('Connected to receipt printer');
    }, 800);
  };

  const handleTestPrint = (): void => {
    if (!isConnected) {
      setStatus('Connect a printer before running a test print');
      return;
    }
    printReceipt(
      '<html><body style="font-family: monospace; padding: 12px;">' +
        '<h3>IPSS - Cafe Elvira</h3>' +
        '<p>Test print</p>' +
        '<p>If you can read this, the printer is working.</p>' +
        '</body></html>'
    )
      .then(() => setStatus('Test print sent'))
      .catch(() => {
        setStatus('Test print failed — check the printer connection');
      });
  };

  const selectConnectionType = (type: PrinterConnectionType): void => {
    setConnectionType(type);
    setIsConnected(false);
    setStatus('');
  };

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
              connectionType === 'wifi' ? printerSettingsStyles.toggleOptionActive : null,
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
          {connectionType === 'bluetooth' ? 'Pair a Bluetooth Printer' : 'Connect a WiFi Printer'}
        </Text>
        <Text style={printerSettingsStyles.cardCaption}>
          {connectionType === 'bluetooth'
            ? 'Keep the printer discoverable, then scan for nearby devices.'
            : 'Enter the printer IP address shown on its network settings.'}
        </Text>

        <View style={printerSettingsStyles.deviceRow}>
          <View style={printerSettingsStyles.deviceInfo}>
            <Text style={printerSettingsStyles.deviceName}>
              {connectionType === 'bluetooth' ? 'No printer paired' : 'No printer configured'}
            </Text>
            <Text style={printerSettingsStyles.deviceStatus}>
              {isConnected ? 'Connected' : 'Not connected'}
            </Text>
          </View>
          <Button
            variant={isConnected ? 'secondary' : 'primary'}
            size="small"
            disabled={isConnecting}
            onPress={handleConnect}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
          </Button>
        </View>
      </View>

      <Button
        variant="outline"
        size="large"
        onPress={handleTestPrint}
        style={printerSettingsStyles.testButton}
      >
        Test Print
      </Button>

      {status ? (
        <View
          style={[
            printerSettingsStyles.statusBanner,
            isConnected ? printerSettingsStyles.statusBannerSuccess : null,
          ]}
        >
          <Text style={printerSettingsStyles.statusText}>{status}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
