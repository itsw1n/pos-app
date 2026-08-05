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
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { InputField } from '../../components/common/InputField/InputField';
import { QtyControls } from '../../components/common/QtyControls/QtyControls';
import { PaymentMode } from '../../types/context';
import { colors } from '../../theme';
import { POSStackParamList } from './POSNavigator';
import { usePOS } from './usePOS';
import { checkoutScreenStyles } from './CheckoutScreen.styles';

type CheckoutScreenProps = StackScreenProps<POSStackParamList, 'Checkout'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_MODES: Array<{ value: PaymentMode; title: string; subtitle: string }> = [
  { value: 'cash', title: 'Cash', subtitle: 'Pay with bills and coins' },
  { value: 'gcash', title: 'GCash', subtitle: 'Scan to pay with GCash' },
  { value: 'maya', title: 'Maya', subtitle: 'Scan to pay with Maya' },
];

const PPN_RATE = 0.11;

export function CheckoutScreen({ navigation, style }: CheckoutScreenProps): React.JSX.Element {
  const { cart, addToCart, decrementItem, getTotal } = usePOS();
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(null);
  const [customerName, setCustomerName] = useState('');
  const subtotal = getTotal();
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  // TODO: confirm VAT with client
  const ppn = subtotal * PPN_RATE;
  const total = subtotal + ppn;

  const handleContinue = (): void => {
    if (!selectedMode) return;
    navigation.navigate('Payment', { paymentMode: selectedMode });
  };

  return (
    <SafeAreaView style={[checkoutScreenStyles.container, style]}>
      <View style={checkoutScreenStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={checkoutScreenStyles.topBarTitle}>Check Out</Text>
        <Pressable>
          <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={checkoutScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={checkoutScreenStyles.infoCard}>
          <View style={checkoutScreenStyles.iconCircle}>
            <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
          </View>
          <View style={checkoutScreenStyles.infoText}>
            <Text style={checkoutScreenStyles.infoLabel}>Order Type</Text>
            <Text style={checkoutScreenStyles.infoValue}>Walk-in</Text>
          </View>
        </View>

        <View style={[checkoutScreenStyles.infoCard, checkoutScreenStyles.infoCardCustomer]}>
          <View style={checkoutScreenStyles.iconCircle}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
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

        {PAYMENT_MODES.map((mode) => {
          const isSelected = selectedMode === mode.value;
          return (
            <Pressable
              key={mode.value}
              style={[
                checkoutScreenStyles.modeCard,
                isSelected ? checkoutScreenStyles.modeCardSelected : null,
              ]}
              onPress={() => setSelectedMode(mode.value)}
            >
              <Text style={checkoutScreenStyles.modeTitle}>{mode.title}</Text>
              <Text style={checkoutScreenStyles.modeSubtitle}>{mode.subtitle}</Text>
            </Pressable>
          );
        })}

        <Pressable
          style={checkoutScreenStyles.processButton}
          onPress={handleContinue}
          disabled={!selectedMode}
        >
          <Text style={checkoutScreenStyles.processButtonText}>
            {selectedMode ? 'Process CheckOut' : 'Select payment method'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}