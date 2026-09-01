import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowRight, ShoppingCart } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { EmptyState } from '@/components/common/EmptyState/EmptyState';
import { ErrorState } from '@/components/common/ErrorState/ErrorState';
import { LoadingState } from '@/components/common/LoadingState/LoadingState';
import { Screen } from '@/components/common/Screen/Screen';
import { QtyControls } from '@/components/common/QtyControls/QtyControls';
import { SearchBar } from '@/components/common/SearchBar/SearchBar';
import { CategoryBar } from '@/components/common/Category/CategoryBar';
import { ProductRow } from '@/components/common/ProductRow/ProductRow';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types/entities';
import { colors } from '@/theme';
import { MenuStackParamList } from '@/features/cashier/menu/MenuNavigator';
import { useMenu } from '@/features/cashier/menu/hooks/useMenu';
import { useCart } from '@/context/CartContext';
import { menuStyles } from './Menu.styles';

type MenuProps = StackScreenProps<MenuStackParamList, 'MenuHome'> & {
  style?: StyleProp<ViewStyle>;
};

const ALL_CATEGORIES = 'All';

type ProductSection = {
  title: string;
  data: Product[];
};

type ProductRowProps = {
  product: Product;
  qty: number;
  onAdd: (product: Product) => void;
  onDecrement: (productId: number) => void;
};

const MenuProductRow = React.memo(function MenuProductRow({
  product,
  qty,
  onAdd,
  onDecrement,
}: ProductRowProps): React.JSX.Element {
  const inCart = qty > 0;
  const canAdd = product.is_available;
  return (
    <ProductRow
      imageUrl={product.image_url}
      name={product.name}
      price={product.price}
      imageSize={64}
      inCart={inCart}
      style={menuStyles.productRow}
      trailing={
        inCart ? (
          <QtyControls
            qty={qty}
            onDecrement={() => onDecrement(product.product_id)}
            onIncrement={() => onAdd(product)}
          />
        ) : (
          <Pressable
            style={({ pressed }) => [
              menuStyles.addButton,
              pressed ? menuStyles.addButtonPressed : null,
              !canAdd ? menuStyles.addButtonDisabled : null,
            ]}
            disabled={!canAdd}
            onPress={() => canAdd && onAdd(product)}
          >
            <ShoppingCart size={18} color={colors.textSecondary} />
          </Pressable>
        )
      }
    />
  );
});

export function Menu({ navigation, style }: MenuProps): React.JSX.Element {
  const {
    cart,
    products,
    isLoading,
    error,
    loadProducts,
    addToCart,
    decrementItem,
  } = useMenu();
  const { total } = useCart();
  const { categories, loadCategories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const categoryNames = useMemo(
    () => categories.map((category) => category.name),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byCategory =
      activeCategory === ALL_CATEGORIES
        ? products
        : products.filter((p) => p.category === activeCategory);
    if (!query) return byCategory;
    return byCategory.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, activeCategory, searchQuery]);

  const qtyByProduct = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of cart) {
      map.set(item.product_id, item.qty);
    }
    return map;
  }, [cart]);

  const sections = useMemo<ProductSection[]>(() => {
    const grouped = new Map<string, Product[]>();
    for (const product of filteredProducts) {
      const list = grouped.get(product.category) ?? [];
      list.push(product);
      grouped.set(product.category, list);
    }
    return Array.from(grouped.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredProducts]);

  const renderProduct = ({ item }: { item: Product }): React.JSX.Element => {
    return (
      <MenuProductRow
        product={item}
        qty={qtyByProduct.get(item.product_id) ?? 0}
        onAdd={addToCart}
        onDecrement={decrementItem}
      />
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: ProductSection;
  }): React.JSX.Element => (
    <Text style={menuStyles.sectionHeader}>{section.title}</Text>
  );

  if (isLoading && products.length === 0) {
    return (
      <Screen style={[menuStyles.container, style]}>
        <LoadingState message="Loading menu..." />
      </Screen>
    );
  }

  if (error && products.length === 0) {
    return (
      <Screen style={[menuStyles.container, style]}>
        <ErrorState
          message={error}
          onRetry={() => void loadProducts()}
          title="Unable to load the menu"
        />
      </Screen>
    );
  }

  return (
    <Screen style={[menuStyles.container, style]}>
      <AppHeader pageTitle="Menu" />

      <SearchBar
        placeholder="Cari Menu"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={menuStyles.search}
      />

      <View style={menuStyles.categoryWrapper}>
        <CategoryBar
          categories={categoryNames}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={renderProduct}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={menuStyles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="No menu items in this category" />
        }
      />

      <Pressable
        style={menuStyles.totalBar}
        onPress={() => navigation.navigate('Checkout')}
      >
        <View style={menuStyles.totalBarLeft}>
          <Text style={menuStyles.totalBarLabel}>Total</Text>
          <ArrowRight size={16} color={colors.surface} />
        </View>
        <Text style={menuStyles.totalBarValue}>₱{total.toFixed(2)}</Text>
      </Pressable>
    </Screen>
  );
}
