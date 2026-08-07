import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowRight, ShoppingCart } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { QtyControls } from '@/components/common/QtyControls/QtyControls';
import { SearchBar } from '@/components/common/SearchBar/SearchBar';
import { CategoryBar } from '@/components/common/Category/CategoryBar';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types/entities';
import { colors, spacing } from '@/theme';
import { MenuStackParamList } from '@/features/cashier/menu/MenuNavigator';
import { useMenu } from '@/features/cashier/menu/hooks/useMenu';
import { menuStyles } from './Menu.styles';

type MenuProps = StackScreenProps<MenuStackParamList, 'Menu'> & {
  style?: StyleProp<ViewStyle>;
};

const ALL_CATEGORIES = 'All';

export function Menu({ navigation, style }: MenuProps): React.JSX.Element {
  const { cart, products, isLoading, error, addToCart, decrementItem, getTotal } = useMenu();
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryNames = useMemo(
    () => categories.map((category) => category.name),
    [categories]
  );

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
          menuStyles.productCard,
          inCart ? menuStyles.productCardInCart : null,
        ]}
      >
        <View style={menuStyles.productImage}>
          <Text style={menuStyles.productImageEmoji}>☕</Text>
        </View>
        <View style={menuStyles.productInfo}>
          <Text style={menuStyles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={menuStyles.productPrice}>₱{item.price.toFixed(2)}</Text>
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
              menuStyles.addButton,
              pressed ? menuStyles.addButtonPressed : null,
              !canAdd ? menuStyles.addButtonDisabled : null,
            ]}
            disabled={!canAdd}
            onPress={() => canAdd && addToCart(item)}
          >
            <ShoppingCart size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={[menuStyles.loadingContainer, style]}>
        <Text style={menuStyles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[menuStyles.container, style]}>
      <AppHeader pageTitle="Menu" />

        <SearchBar
          placeholder="Cari Menu"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginHorizontal: spacing['2xl'], marginVertical: spacing.md }}
        />

      <View style={menuStyles.categoryWrapper}>
        <CategoryBar
          categories={categoryNames}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

      {error ? <Text style={menuStyles.errorText}>{error}</Text> : null}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={renderProduct}
        contentContainerStyle={menuStyles.content}
        showsVerticalScrollIndicator={false}
      />

      <Pressable style={menuStyles.totalBar} onPress={() => navigation.navigate('Checkout')}>
        <View style={menuStyles.totalBarLeft}>
          <Text style={menuStyles.totalBarLabel}>Total</Text>
          <ArrowRight size={16} color={colors.surface} />
        </View>
        <Text style={menuStyles.totalBarValue}>₱{total.toFixed(2)}</Text>
      </Pressable>
    </SafeAreaView>
  );
}