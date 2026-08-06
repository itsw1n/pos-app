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
import { InputField } from '../../components/common/InputField/InputField';
import { QtyControls } from '../../components/common/QtyControls/QtyControls';
import { colors } from '../../theme';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { checkoutScreenStyles } from './CheckoutScreen.styles';

type CheckoutScreenProps = StackScreenProps<POSStackParamList, 'Checkout'> & {
  style?: StyleProp<ViewStyle>;
};

const PPN_RATE = 0.11;

export function CheckoutScreen({ navigation, style }: CheckoutScreenProps): React.JSX.Element {
  const { cart, addToCart, decrementItem, getTotal } = usePOS();
  const [customerName, setCustomerName] = useState('');
  const subtotal = getTotal();

  // TODO: confirm VAT with client
  const ppn = subtotal * PPN_RATE;
  const total = subtotal + ppn;

  const handleContinue = (): void => {
    navigation.navigate('Payment', { paymentMode: 'cash' });
  };

  return (
    <SafeAreaView style={[checkoutScreenStyles.container, style]}>
      <View style={checkoutScreenStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={checkoutScreenStyles.topBarTitle}>Check Out</Text>
        <View style={checkoutScreenStyles.topBarBalance} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={checkoutScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={checkoutScreenStyles.infoCard}>
          <View style={checkoutScreenStyles.iconCircle}>
            <Utensils size={20} color={colors.primary} />
          </View>
          <View style={checkoutScreenStyles.infoText}>
            <Text style={checkoutScreenStyles.infoLabel}>Order Type</Text>
            <Text style={checkoutScreenStyles.infoValue}>Walk-in</Text>
          </View>
        </View>

        <View style={[checkoutScreenStyles.infoCard, checkoutScreenStyles.infoCardCustomer]}>
          <View style={checkoutScreenStyles.iconCircle}>
            <User size={20} color={colors.primary} />
          </View>
          <View style={checkoutScreenStyles.infoText}>
            <Text style={checkoutScreenStyles.infoLabel}>Nama Customer</Text>
            <InputField
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
            />
          </View>
        </View>

        <Text style={checkoutScreenStyles.sectionLabel}>Menu ElviraCafe</Text>

        <View style={checkoutScreenStyles.orderItems}>
          {cart.map((item) => (
            <View key={String(item.product_id)} style={checkoutScreenStyles.orderItemCard}>
              <View style={checkoutScreenStyles.productImage}>
                <Text style={checkoutScreenStyles.productImageEmoji}>☕</Text>
              </View>
              <View style={checkoutScreenStyles.productInfo}>
                <Text style={checkoutScreenStyles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={checkoutScreenStyles.productPrice}>₱{item.price.toFixed(2)}</Text>
              </View>
              <QtyControls
                qty={item.qty}
                onDecrement={() => decrementItem(item.product_id)}
                onIncrement={() => addToCart(item)}
              />
            </View>
          ))}
        </View>

        <View style={checkoutScreenStyles.divider} />

        <View style={checkoutScreenStyles.paymentSection}>
          <Text style={checkoutScreenStyles.paymentTitle}>PAYMENT DETAIL</Text>
          <View style={checkoutScreenStyles.detailRow}>
            <Text style={checkoutScreenStyles.detailLabel}>Subtotal</Text>
            <Text style={checkoutScreenStyles.detailValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          {/*
            TODO: confirm VAT with client before enabling
          */}
          <View style={checkoutScreenStyles.detailRow}>
            <Text style={checkoutScreenStyles.detailLabel}>PPN 11%</Text>
            <Text style={[checkoutScreenStyles.detailValue, checkoutScreenStyles.detailValueSecondary]}>
              ₱{ppn.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={checkoutScreenStyles.divider} />

        <View style={checkoutScreenStyles.totalRow}>
          <Text style={checkoutScreenStyles.totalLabel}>Total</Text>
          <Text style={checkoutScreenStyles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Pressable style={checkoutScreenStyles.processButton} onPress={handleContinue}>
          <Text style={checkoutScreenStyles.processButtonText}>Process Check Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}