import React from 'react';
import { FlatList, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartItem } from '../../types/context';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { cartScreenStyles } from './CartScreen.styles';

type CartScreenProps = StackScreenProps<POSStackParamList, 'Cart'> & {
  style?: StyleProp<ViewStyle>;
};

export function CartScreen({ navigation, style }: CartScreenProps): React.JSX.Element {
  const { cart, addToCart, decrementItem, getTotal } = usePOS();
  const total = getTotal();

  const renderItem = ({ item }: { item: CartItem }): React.JSX.Element => (
    <View style={cartScreenStyles.itemCard}>
      <View style={cartScreenStyles.itemInfo}>
        <Text style={cartScreenStyles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={cartScreenStyles.itemPrice}>₱{item.price.toFixed(2)} each</Text>
      </View>
      <View style={cartScreenStyles.qtyControls}>
        <Pressable
          style={({ pressed }) => [
            cartScreenStyles.qtyButton,
            pressed ? cartScreenStyles.qtyButtonPressed : null,
          ]}
          onPress={() => decrementItem(item.product_id)}
        >
          <Text style={cartScreenStyles.qtyButtonText}>−</Text>
        </Pressable>
        <Text style={cartScreenStyles.qtyValue}>{item.qty}</Text>
        <Pressable
          style={({ pressed }) => [
            cartScreenStyles.qtyButton,
            pressed ? cartScreenStyles.qtyButtonPressed : null,
          ]}
          onPress={() => addToCart(item)}
        >
          <Text style={cartScreenStyles.qtyButtonText}>+</Text>
        </Pressable>
      </View>
      <Text style={cartScreenStyles.itemTotal}>₱{(item.price * item.qty).toFixed(2)}</Text>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={[cartScreenStyles.emptyContainer, style]}>
        <Text style={cartScreenStyles.emptyTitle}>Your cart is empty</Text>
        <Text style={cartScreenStyles.emptyText}>
          Add items from the menu to start a sale.
        </Text>
        <Pressable
          style={({ pressed }) => [
            cartScreenStyles.emptyButton,
            pressed ? cartScreenStyles.emptyButtonPressed : null,
          ]}
          onPress={() => navigation.navigate('POS')}
        >
          <Text style={cartScreenStyles.emptyButtonText}>Browse Menu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[cartScreenStyles.container, style]}>
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={renderItem}
        contentContainerStyle={cartScreenStyles.listContent}
      />
      <View style={cartScreenStyles.footer}>
        <View style={cartScreenStyles.totalRow}>
          <Text style={cartScreenStyles.totalLabel}>Total</Text>
          <Text style={cartScreenStyles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            cartScreenStyles.checkoutButton,
            pressed ? cartScreenStyles.checkoutButtonPressed : null,
            cart.length === 0 ? cartScreenStyles.checkoutButtonDisabled : null,
          ]}
          disabled={cart.length === 0}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={cartScreenStyles.checkoutButtonText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}
