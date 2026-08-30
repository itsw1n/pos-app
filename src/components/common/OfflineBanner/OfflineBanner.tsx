import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { offlineBannerStyles } from './OfflineBanner.styles';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export interface OfflineBannerProps {
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function OfflineBanner({
  visible = true,
  style,
}: OfflineBannerProps): React.JSX.Element {
  const { lastResult } = useOfflineSync();
  const hasFailure = lastResult !== null && lastResult.failed > 0;

  if (!visible && !hasFailure) return <></>;

  let text = 'Offline — sales are queued';
  if (hasFailure && lastResult) {
    text = lastResult.lastError
      ? `Queued: ${lastResult.failed} \u2022 Last sync failed: ${lastResult.lastError}`
      : `Queued: ${lastResult.failed} \u2022 Last sync failed`;
  }

  return (
    <View style={[offlineBannerStyles.root, style]}>
      <Text style={offlineBannerStyles.text}>{text}</Text>
    </View>
  );
}
