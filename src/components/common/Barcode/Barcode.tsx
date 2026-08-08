import React, { useMemo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { encodeCode128 } from '@/utils/code128';
import { colors } from '@/theme';
import { barcodeStyles } from './Barcode.styles';

interface BarcodeProps {
  value: string;
  height?: number;
  barColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Barcode({
  value,
  height = 48,
  barColor = colors.textPrimary,
  style,
}: BarcodeProps): React.JSX.Element {
  const { totalModules, bars } = useMemo(() => encodeCode128(value), [value]);

  const moduleWidth = 100 / totalModules;

  return (
    <View style={[barcodeStyles.container, style]}>
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        {bars.map((bar, index) => (
          <Rect
            key={index}
            x={bar.start * moduleWidth}
            y={0}
            width={bar.width * moduleWidth}
            height={height}
            fill={barColor}
          />
        ))}
      </Svg>
    </View>
  );
}
