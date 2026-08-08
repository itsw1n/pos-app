import React, { useCallback, useState } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { productImageStyles } from './ProductImage.styles';

export interface ProductImageProps {
  imageUrl: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProductImage({
  imageUrl,
  size,
  style,
}: ProductImageProps): React.JSX.Element {
  const [failed, setFailed] = useState(false);
  const showFallback = !imageUrl || failed;

  const width = size ?? 64;

  const tileStyle: StyleProp<ViewStyle> = [
    productImageStyles.tile,
    { width, height: width },
  ];

  const handleError = useCallback((): void => {
    setFailed(true);
  }, []);

  if (showFallback) {
    return (
      <View style={[productImageStyles.tileBase, tileStyle, style]}>
        <Text style={productImageStyles.emoji}>☕</Text>
      </View>
    );
  }

  return (
    <View style={[productImageStyles.tileBase, tileStyle, style]}>
      <Image
        source={{ uri: imageUrl as string }}
        style={productImageStyles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        onError={handleError}
      />
    </View>
  );
}
