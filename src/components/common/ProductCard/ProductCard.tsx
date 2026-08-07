import React from 'react';
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { productCardStyles } from './ProductCard.styles';

export interface ProductCardProps {
  name: string;
  price: number;
  isAvailable: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ProductCard({
  name,
  price,
  isAvailable,
  onPress,
  style,
}: ProductCardProps): React.JSX.Element {
  return (
    <Pressable
      disabled={!isAvailable || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        productCardStyles.root,
        pressed && isAvailable ? productCardStyles.pressed : null,
        !isAvailable ? productCardStyles.unavailable : null,
        style,
      ]}
    >
      <Text style={productCardStyles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={productCardStyles.price}>₱{price.toFixed(2)}</Text>
      <Text
        style={[
          productCardStyles.availability,
          isAvailable
            ? productCardStyles.availableText
            : productCardStyles.unavailableText,
        ]}
      >
        {isAvailable ? 'Available' : 'Out of stock'}
      </Text>
    </Pressable>
  );
}
