import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Button } from '../../components/common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types/entities';
import { ProductsStackParamList } from './ProductsNavigator';
import { useProducts } from './useProducts';
import { productsScreenStyles } from './ProductsScreen.styles';

type ProductsScreenProps = StackScreenProps<ProductsStackParamList, 'Products'> & {
  style?: StyleProp<ViewStyle>;
};

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductsScreen({ navigation, style }: ProductsScreenProps): React.JSX.Element {
  const { role } = useAuth();
  const { products, isLoading, error, loadProducts, deleteProduct } = useProducts();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
    }, [loadProducts])
  );

  if (role !== 'admin') {
    return (
      <View style={[productsScreenStyles.container, productsScreenStyles.loadingContainer, style]}>
        <Text style={productsScreenStyles.loadingText}>Admin access required</Text>
      </View>
    );
  }

  const confirmDelete = (product: Product): void => {
    Alert.alert(
      'Delete product',
      `Remove "${product.name}" from the menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletingId(product.product_id);
            deleteProduct(product.product_id)
              .catch((err) => {
                Alert.alert(
                  'Delete failed',
                  err instanceof Error ? err.message : 'Could not delete product'
                );
              })
              .finally(() => setDeletingId(null));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }): React.JSX.Element => (
    <View style={productsScreenStyles.itemCard}>
      <View style={productsScreenStyles.itemHeader}>
        <View style={productsScreenStyles.itemInfo}>
          <Text style={productsScreenStyles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={productsScreenStyles.itemCategory}>{item.category}</Text>
        </View>
        <View
          style={[
            productsScreenStyles.badge,
            item.is_available
              ? productsScreenStyles.badgeAvailable
              : productsScreenStyles.badgeUnavailable,
          ]}
        >
          <Text style={productsScreenStyles.badgeText}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      <View style={productsScreenStyles.itemFooter}>
        <Text style={productsScreenStyles.itemPrice}>{formatPeso(item.price)}</Text>
      </View>
      <View style={productsScreenStyles.actionsRow}>
        <Button
          variant="outline"
          size="small"
          style={productsScreenStyles.actionButton}
          onPress={() =>
            navigation.navigate('AddEditProduct', {
              product: item,
            })
          }
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="small"
          style={[productsScreenStyles.actionButton, productsScreenStyles.actionButtonLast]}
          disabled={deletingId === item.product_id}
          onPress={() => confirmDelete(item)}
        >
          {deletingId === item.product_id ? 'Deleting...' : 'Delete'}
        </Button>
      </View>
    </View>
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={[productsScreenStyles.container, productsScreenStyles.loadingContainer, style]}>
        <Text style={productsScreenStyles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={[productsScreenStyles.container, style]}>
      <View style={productsScreenStyles.content}>
        <View style={productsScreenStyles.headerRow}>
          <View>
            <Text style={productsScreenStyles.headerTitle}>Manage Products</Text>
            <Text style={productsScreenStyles.headerCaption}>
              {products.length} product(s) on the menu
            </Text>
          </View>
          <Button
            size="small"
            onPress={() => navigation.navigate('AddEditProduct', undefined)}
          >
            Add Product
          </Button>
        </View>

        {error ? <Text style={productsScreenStyles.errorText}>{error}</Text> : null}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={renderItem}
        contentContainerStyle={productsScreenStyles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={productsScreenStyles.emptyContainer}>
            <Text style={productsScreenStyles.emptyText}>No products yet — add your first one</Text>
          </View>
        }
      />
    </View>
  );
}
