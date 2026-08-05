import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { qtyControlsStyles } from './QtyControls.styles';

export interface QtyControlsProps {
  qty: number;
  onDecrement: () => void;
  onIncrement: () => void;
  style?: StyleProp<ViewStyle>;
}

export function QtyControls({
  qty,
  onDecrement,
  onIncrement,
  style,
}: QtyControlsProps): React.JSX.Element {
  return (
    <View style={[qtyControlsStyles.row, style]}>
      <Pressable
        style={({ pressed }) => [
          qtyControlsStyles.decrementButton,
          pressed ? qtyControlsStyles.pressed : null,
        ]}
        onPress={onDecrement}
      >
        <Text style={qtyControlsStyles.buttonText}>−</Text>
      </Pressable>
      <Text style={qtyControlsStyles.value}>{qty}</Text>
      <Pressable
        style={({ pressed }) => [
          qtyControlsStyles.incrementButton,
          pressed ? qtyControlsStyles.pressed : null,
        ]}
        onPress={onIncrement}
      >
        <Text style={[qtyControlsStyles.buttonText, qtyControlsStyles.incrementButtonText]}>
          +
        </Text>
      </Pressable>
    </View>
  );
}