import React from 'react';
import { Text, View } from 'react-native';
import { offlineBannerStyles } from './OfflineBanner.styles';

export interface OfflineBannerProps {
  visible?: boolean;
}

export function OfflineBanner({
  visible = true,
}: OfflineBannerProps): React.JSX.Element {
  if (!visible) return <></>;
  return (
    <View style={offlineBannerStyles.root}>
      <Text style={offlineBannerStyles.text}>Offline — sales are queued</Text>
    </View>
  );
}
