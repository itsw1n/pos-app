import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { QtyControls } from '../../components/common/QtyControls/QtyControls';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { Product } from '../../types/entities';
import { colors, spacing } from '../../theme';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { posScreenStyles } from './POSScreen.styles';

type POSScreenProps = StackScreenProps<POSStackParamList, 'POS'> & {
  style?: StyleProp<ViewStyle>;
};

const ALL_CATEGORIES = 'All';

export function POSScreen({ navigation, style }: POSScreenProps): React.JSX.Element {
  const { cart, products, isLoading, error, addToCart, decrementItem, getTotal } = usePOS();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return [ALL_CATEGORIES, ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byCategory =
      activeCategory === ALL_CATEGORIES ? products : products.filter((p) => p.category === activeCategory);
    if (!query) return byCategory;
    return byCategory.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, activeCategory, searchQuery]);

  const cartQty = (productId: number): number => {
    const item = cart.find((i) => i.product_id === productId);
    return item ? item.qty : 0;
  };

  const total = getTotal();

  const renderProduct = ({ item }: { item: Product }): React.JSX.Element => {
    const inCart = cartQty(item.product_id) > 0;
    const canAdd = item.is_available;
    return (
      <View
        style={[
          posScreenStyles.productCard,
          inCart ? posScreenStyles.productCardInCart : null,
        ]}
      >
        <View style={posScreenStyles.productImage}>
          <Text style={posScreenStyles.productImageEmoji}>☕</Text>
        </View>
        <View style={posScreenStyles.productInfo}>
          <Text style={posScreenStyles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={posScreenStyles.productPrice}>₱{item.price.toFixed(2)}</Text>
        </View>
        {inCart ? (
          <QtyControls
            qty={cartQty(item.product_id)}
            onDecrement={() => decrementItem(item.product_id)}
            onIncrement={() => addToCart(item)}
          />
        ) : (
          <Pressable
            style={({ pressed }) => [
              posScreenStyles.addButton,
              pressed ? posScreenStyles.addButtonPressed : null,
              !canAdd ? posScreenStyles.addButtonDisabled : null,
            ]}
            disabled={!canAdd}
            onPress={() => canAdd && addToCart(item)}
          >
            <Ionicons name="cart-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
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
    <SafeAreaView style={[posScreenStyles.container, style]}>
      <View style={posScreenStyles.topBar}>
        <View style={posScreenStyles.brandRow}>
          <View style={posScreenStyles.avatar}>
            <Ionicons name="person" size={18} color={colors.surface} />
          </View>
          <Text style={posScreenStyles.brandName}>Ivory Dolina</Text>
        </View>
        <Pressable>
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

        <SearchBar
          placeholder="Cari Menu"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginHorizontal: spacing['2xl'], marginVertical: spacing.md }}
        />

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
              style={[
                posScreenStyles.categoryTab,
                isActive ? posScreenStyles.categoryTabActive : null,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Ionicons
                name="cafe-outline"
                size={14}
                color={isActive ? colors.surface : colors.textSecondary}
              />
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
        contentContainerStyle={posScreenStyles.content}
        showsVerticalScrollIndicator={false}
      />

      <Pressable style={posScreenStyles.totalBar} onPress={() => navigation.navigate('Cart')}>
        <View style={posScreenStyles.totalBarLeft}>
          <Text style={posScreenStyles.totalBarLabel}>Total</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.surface} />
        </View>
        <Text style={posScreenStyles.totalBarValue}>₱{total.toFixed(2)}</Text>
      </Pressable>
    </SafeAreaView>
  );
}