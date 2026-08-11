import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { offlineBannerStyles } from './OfflineBanner.styles';

export interface OfflineBannerProps {
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function OfflineBanner({
  visible = true,
  style,
}: OfflineBannerProps): React.JSX.Element {
  if (!visible) return <></>;
  return (
    <View style={[offlineBannerStyles.root, style]}>
      <Text style={offlineBannerStyles.text}>Offline — sales are queued</Text>
    </View>
  );
}
