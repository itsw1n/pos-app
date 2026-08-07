import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  SectionList,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Pencil, Plus, Tags, Trash2, UtensilsCrossed } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppHeader } from '../../components/common/AppHeader/AppHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { CategoryBar } from '../../components/common/Category/CategoryBar';
import { CategoryPickerModal } from '../../components/common/Category/CategoryPickerModal';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '../../context/AuthContext';
import { toErrorMessage } from '../../services/errors';
import { colors } from '../../theme';
import { Category, Product } from '../../types/entities';
import { ProductsStackParamList } from './ProductsNavigator';
import { AddCategoryModal } from './AddCategoryModal';
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
  const { role } = useAuth();
  const { products, isLoading, error, loadProducts } = useProducts();
  const { categories, loadCategories, createCategory, deleteCategory } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [deletePickerVisible, setDeletePickerVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
      void loadCategories();
    }, [loadProducts, loadCategories])
  );

  const categoryNames = useMemo(
    () => categories.map((category) => category.name),
    [categories]
  );

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

  const handleAddCategory = useCallback(
    async (name: string): Promise<void> => {
      const category = await createCategory(name);
      setActiveCategory(category.name);
    },
    [createCategory]
  );

  const handleCategorySelectedToDelete = useCallback(
    (categoryId: string, _name: string): void => {
      setDeletePickerVisible(false);
      const category = categories.find((item) => item.category_id === categoryId);
      if (category) {
        setCategoryToDelete(category);
        setDeleteError('');
      }
    },
    [categories]
  );

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!categoryToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteCategory(categoryToDelete.category_id);
      setCategoryToDelete(null);
      setActiveCategory((current) =>
        current === categoryToDelete.name ? ALL_CATEGORIES : current
      );
      void loadProducts();
    } catch (err) {
      setDeleteError(toErrorMessage(err, 'Failed to delete category'));
    } finally {
      setIsDeleting(false);
    }
  }, [categoryToDelete, isDeleting, deleteCategory, loadProducts]);

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
        <Pencil size={16} color={colors.textSecondary} />
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
      <AppHeader pageTitle="Products" />

      <SearchBar
        placeholder="Search menu items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={productsScreenStyles.searchBar}
      />

      <View style={productsScreenStyles.categoryWrapper}>
        <CategoryBar
          categories={categoryNames}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

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
        onPress={() => setFabMenuVisible(true)}
      >
        <Plus size={26} color={colors.surface} />
      </Pressable>

      <Modal
        visible={fabMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFabMenuVisible(false)}
      >
        <Pressable style={productsScreenStyles.fabMenuBackdrop} onPress={() => setFabMenuVisible(false)}>
          <View style={productsScreenStyles.fabMenuSheet}>
            <Text style={productsScreenStyles.fabMenuTitle}>Menu Options</Text>
            <Pressable
              style={({ pressed }) => [
                productsScreenStyles.fabMenuOption,
                pressed ? productsScreenStyles.fabMenuOptionPressed : null,
              ]}
              onPress={() => {
                setFabMenuVisible(false);
                navigation.navigate('AddEditProduct', undefined);
              }}
            >
              <View style={productsScreenStyles.fabMenuOptionIcon}>
                <UtensilsCrossed size={20} color={colors.primary} />
              </View>
              <View style={productsScreenStyles.fabMenuOptionTextBlock}>
                <Text style={productsScreenStyles.fabMenuOptionTitle}>Add Product</Text>
                <Text style={productsScreenStyles.fabMenuOptionCaption}>
                  Create a new menu item
                </Text>
              </View>
            </Pressable>
            <View style={productsScreenStyles.fabMenuDivider} />
            <Pressable
              style={({ pressed }) => [
                productsScreenStyles.fabMenuOption,
                pressed ? productsScreenStyles.fabMenuOptionPressed : null,
              ]}
              onPress={() => {
                setFabMenuVisible(false);
                setCategoryModalVisible(true);
              }}
            >
              <View style={productsScreenStyles.fabMenuOptionIcon}>
                <Tags size={20} color={colors.primary} />
              </View>
              <View style={productsScreenStyles.fabMenuOptionTextBlock}>
                <Text style={productsScreenStyles.fabMenuOptionTitle}>Add Category</Text>
                <Text style={productsScreenStyles.fabMenuOptionCaption}>
                  Create a new product category
                </Text>
              </View>
            </Pressable>
            <View style={productsScreenStyles.fabMenuDivider} />
            <Pressable
              style={({ pressed }) => [
                productsScreenStyles.fabMenuOption,
                pressed ? productsScreenStyles.fabMenuOptionPressed : null,
              ]}
              onPress={() => {
                setFabMenuVisible(false);
                setDeletePickerVisible(true);
              }}
            >
              <View style={productsScreenStyles.fabMenuOptionIcon}>
                <Trash2 size={20} color={colors.danger} />
              </View>
              <View style={productsScreenStyles.fabMenuOptionTextBlock}>
                <Text
                  style={[
                    productsScreenStyles.fabMenuOptionTitle,
                    productsScreenStyles.fabMenuOptionTitleDanger,
                  ]}
                >
                  Delete Category
                </Text>
                <Text style={productsScreenStyles.fabMenuOptionCaption}>
                  Remove a category and unlink its products
                </Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <AddCategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSubmit={handleAddCategory}
      />

      <CategoryPickerModal
        visible={deletePickerVisible}
        categories={categories}
        title="Delete Category"
        onClose={() => setDeletePickerVisible(false)}
        onSelect={handleCategorySelectedToDelete}
      />

      <ConfirmDialog
        visible={categoryToDelete !== null}
        title={categoryToDelete ? `Delete "${categoryToDelete.name}"?` : ''}
        message={
          deleteError
            ? deleteError
            : 'Products in this category will move to "Uncategorized".'
        }
        confirmLabel="Delete"
        destructive
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          setCategoryToDelete(null);
          setDeleteError('');
        }}
      />
    </SafeAreaView>
  );
}
