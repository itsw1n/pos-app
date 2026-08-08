import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { ProductImage } from '@/components/common/ProductImage/ProductImage';
import { productRowStyles } from './ProductRow.styles';

export interface ProductRowProps {
  imageUrl: string | null;
  name: string;
  price: number;
  imageSize?: number;
  trailing?: React.ReactNode;
  inCart?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProductRow({
  imageUrl,
  name,
  price,
  imageSize,
  trailing,
  inCart = false,
  style,
}: ProductRowProps): React.JSX.Element {
  return (
    <View
      style={[
        productRowStyles.root,
        inCart ? productRowStyles.inCart : null,
        style,
      ]}
    >
      <ProductImage
        imageUrl={imageUrl}
        size={imageSize ?? 64}
        style={productRowStyles.imageMargin}
      />
      <View style={productRowStyles.info}>
        <Text style={productRowStyles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={productRowStyles.price}>₱{price.toFixed(2)}</Text>
      </View>
      {trailing}
    </View>
  );
}
