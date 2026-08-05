import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Product } from '../../types/entities';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { posScreenStyles } from './POSScreen.styles';

type POSScreenProps = StackScreenProps<POSStackParamList, 'POS'> & {
  style?: StyleProp<ViewStyle>;
};

const ALL_CATEGORIES = 'All';

export function POSScreen({ navigation, style }: POSScreenProps): React.JSX.Element {
  const { cart, products, isLoading, error, addToCart, getTotal } = usePOS();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return [ALL_CATEGORIES, ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = getTotal();

  const renderProduct = ({ item }: { item: Product }): React.JSX.Element => {
    const canAdd = item.is_available;
    return (
      <Pressable
        style={({ pressed }) => [
          posScreenStyles.productCard,
          pressed ? posScreenStyles.productCardPressed : null,
          !canAdd ? posScreenStyles.productCardDisabled : null,
        ]}
        disabled={!canAdd}
        onPress={() => canAdd && addToCart(item)}
      >
        <Text style={posScreenStyles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={posScreenStyles.productCategory}>{item.category}</Text>
        <Text style={posScreenStyles.productPrice}>₱{item.price.toFixed(2)}</Text>
      </Pressable>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={[posScreenStyles.loadingContainer, style]}>
        <Text style={posScreenStyles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={[posScreenStyles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={posScreenStyles.categoryBar}
      >
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <Pressable
              key={category}
              style={[posScreenStyles.categoryTab, isActive ? posScreenStyles.categoryTabActive : null]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  posScreenStyles.categoryTabText,
                  isActive ? posScreenStyles.categoryTabTextActive : null,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? <Text style={posScreenStyles.errorText}>{error}</Text> : null}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={posScreenStyles.gridColumn}
        contentContainerStyle={posScreenStyles.content}
        showsVerticalScrollIndicator={false}
      />

      <View style={posScreenStyles.cartBar}>
        <View style={posScreenStyles.cartBarInfo}>
          <Text style={posScreenStyles.cartBarText}>
            {totalItems} item{totalItems === 1 ? '' : 's'} in cart
          </Text>
          <Text style={posScreenStyles.cartBarTotal}>₱{total.toFixed(2)}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            posScreenStyles.cartBarButton,
            pressed ? posScreenStyles.cartBarButtonPressed : null,
          ]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={posScreenStyles.cartBarButtonText}>View Cart</Text>
        </Pressable>
      </View>
    </View>
  );
}
