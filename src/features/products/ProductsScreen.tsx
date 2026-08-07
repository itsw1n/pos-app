import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { Product } from '../../types/entities';
import { ProductsStackParamList } from './ProductsNavigator';
import { useProducts } from './useProducts';
import { productsScreenStyles } from './ProductsScreen.styles';

type ProductsScreenProps = StackScreenProps<ProductsStackParamList, 'Products'> & {
  style?: StyleProp<ViewStyle>;
};

type ProductSection = {
  title: string;
  data: Product[];
};

const ALL_CATEGORIES = 'All';

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductsScreen({ navigation, style }: ProductsScreenProps): React.JSX.Element {
  const { user, role } = useAuth();
  const { products, isLoading, error, loadProducts } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
    }, [loadProducts])
  );

  const initials = (user?.username?.[0] ?? '').toUpperCase();

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return [ALL_CATEGORIES, ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byCategory =
      activeCategory === ALL_CATEGORIES
        ? products
        : products.filter((p) => p.category === activeCategory);
    if (!query) return byCategory;
    return byCategory.filter(
      (p) =>
        p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  }, [products, activeCategory, searchQuery]);

  const sections = useMemo<ProductSection[]>(() => {
    const grouped = new Map<string, Product[]>();
    for (const product of filteredProducts) {
      const list = grouped.get(product.category) ?? [];
      list.push(product);
      grouped.set(product.category, list);
    }
    return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
  }, [filteredProducts]);

  if (role !== 'admin') {
    return (
      <View style={[productsScreenStyles.container, productsScreenStyles.loadingContainer, style]}>
        <Text style={productsScreenStyles.loadingText}>Admin access required</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Product }): React.JSX.Element => (
    <View style={productsScreenStyles.productRow}>
      <View style={productsScreenStyles.emojiTile}>
        <Text style={productsScreenStyles.emojiText}>☕</Text>
      </View>
      <View style={productsScreenStyles.productInfo}>
        <Text style={productsScreenStyles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={productsScreenStyles.productPrice}>{formatPeso(item.price)}</Text>
      </View>
      <Pressable
        hitSlop={8}
        style={productsScreenStyles.editButton}
        onPress={() => navigation.navigate('AddEditProduct', { product: item })}
      >
        <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: ProductSection }): React.JSX.Element => (
    <Text style={productsScreenStyles.sectionHeader}>{section.title}</Text>
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={[productsScreenStyles.container, productsScreenStyles.loadingContainer, style]}>
        <Text style={productsScreenStyles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[productsScreenStyles.container, style]}>
      <View style={productsScreenStyles.topBar}>
        <Pressable
          style={productsScreenStyles.topBarBack}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={productsScreenStyles.topBarTitle}>Elvira Cafe</Text>
        <View style={productsScreenStyles.avatar}>
          <Text style={productsScreenStyles.avatarText}>{initials || '?'}</Text>
        </View>
      </View>

      <SearchBar
        placeholder="Search menu items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={productsScreenStyles.searchBar}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={productsScreenStyles.categoryBar}
      >
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <Pressable
              key={category}
              style={[
                productsScreenStyles.categoryTab,
                isActive ? productsScreenStyles.categoryTabActive : null,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  productsScreenStyles.categoryTabText,
                  isActive ? productsScreenStyles.categoryTabTextActive : null,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? <Text style={productsScreenStyles.errorText}>{error}</Text> : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={productsScreenStyles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={productsScreenStyles.emptyContainer}>
            <Text style={productsScreenStyles.emptyText}>No products yet — add your first one</Text>
          </View>
        }
      />

      <Pressable
        style={({ pressed }) => [
          productsScreenStyles.fab,
          pressed ? productsScreenStyles.fabPressed : null,
        ]}
        onPress={() => navigation.navigate('AddEditProduct', undefined)}
      >
        <Ionicons name="add" size={26} color={colors.surface} />
      </Pressable>
    </SafeAreaView>
  );
}
