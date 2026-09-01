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
  const syncStatus = useOfflineSync();
  const hasFailure = syncStatus.state === 'error';
  const hasPendingRecords = syncStatus.pendingCount > 0;

  if (!visible && !hasFailure && !hasPendingRecords) return <></>;

  let text = 'Offline — sales are queued';
  if (syncStatus.state === 'syncing') {
    text = 'Synchronizing queued records...';
  } else if (hasFailure) {
    text = `${syncStatus.pendingCount} record(s) queued — synchronization will retry`;
  } else if (hasPendingRecords) {
    text = `${syncStatus.pendingCount} record(s) waiting to synchronize`;
  }

  return (
    <View style={[offlineBannerStyles.root, style]}>
      <Text style={offlineBannerStyles.text}>{text}</Text>
    </View>
  );
}
