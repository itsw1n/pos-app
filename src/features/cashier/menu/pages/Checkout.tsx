import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeft, Utensils, User } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { InputField } from '@/components/common/InputField/InputField';
import { QtyControls } from '@/components/common/QtyControls/QtyControls';
import { ProductRow } from '@/components/common/ProductRow/ProductRow';
import { colors } from '@/theme';
import { MenuStackParamList } from '@/features/cashier/menu/MenuNavigator';
import { useMenu } from '@/features/cashier/menu/hooks/useMenu';
import { checkoutStyles } from './Checkout.styles';

type CheckoutProps = StackScreenProps<MenuStackParamList, 'Checkout'> & {
  style?: StyleProp<ViewStyle>;
};

export function Checkout({
  navigation,
  style,
}: CheckoutProps): React.JSX.Element {
  const { cart, addToCart, decrementItem, getTotal } = useMenu();
  const [customerName, setCustomerName] = useState('');
  const total = getTotal();

  const handleContinue = (): void => {
    navigation.navigate('Payment', { paymentMode: 'cash' });
  };

  return (
    <SafeAreaView style={[checkoutStyles.container, style]}>
      <View style={checkoutStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={checkoutStyles.topBarTitle}>Check Out</Text>
        <View style={checkoutStyles.topBarBalance} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={checkoutStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={checkoutStyles.infoCard}>
          <View style={checkoutStyles.iconCircle}>
            <Utensils size={20} color={colors.primary} />
          </View>
          <View style={checkoutStyles.infoText}>
            <Text style={checkoutStyles.infoLabel}>Order Type</Text>
            <Text style={checkoutStyles.infoValue}>Walk-in</Text>
          </View>
        </View>

        <View
          style={[checkoutStyles.infoCard, checkoutStyles.infoCardCustomer]}
        >
          <View style={checkoutStyles.iconCircle}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={checkoutStyles.infoText}>
            <Text style={checkoutStyles.infoLabel}>Nama Customer</Text>
            <InputField
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
            />
          </View>
        </View>

        <Text style={checkoutStyles.sectionLabel}>Menu ElviraCafe</Text>

        <View style={checkoutStyles.orderItems}>
          {cart.map((item) => (
            <ProductRow
              key={String(item.product_id)}
              imageUrl={item.image_url}
              name={item.name}
              price={item.price}
              imageSize={56}
              trailing={
                <QtyControls
                  qty={item.qty}
                  onDecrement={() => decrementItem(item.product_id)}
                  onIncrement={() => addToCart(item)}
                />
              }
            />
          ))}
        </View>

        <View style={checkoutStyles.divider} />

        <View style={checkoutStyles.paymentSection}>
          <Text style={checkoutStyles.paymentTitle}>PAYMENT DETAIL</Text>
          <View style={checkoutStyles.detailRow}>
            <Text style={checkoutStyles.detailLabel}>Subtotal</Text>
            <Text style={checkoutStyles.detailValue}>₱{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={checkoutStyles.divider} />

        <View style={checkoutStyles.totalRow}>
          <Text style={checkoutStyles.totalLabel}>Total</Text>
          <Text style={checkoutStyles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Pressable
          style={checkoutStyles.processButton}
          onPress={handleContinue}
        >
          <Text style={checkoutStyles.processButtonText}>
            Process Check Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
