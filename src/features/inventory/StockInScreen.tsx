import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { InputField } from '../../components/common/InputField/InputField';
import { colors } from '../../theme';
import { InventoryStackParamList } from './InventoryNavigator';
import { useInventory } from './useInventory';
import { stockInScreenStyles } from './StockInScreen.styles';

type StockInScreenProps = StackScreenProps<InventoryStackParamList, 'StockIn'> & {
  style?: StyleProp<ViewStyle>;
};

export function StockInScreen({ navigation, route, style }: StockInScreenProps): React.JSX.Element {
  const { stockId, productName, currentQuantity, reorderLevel } = route.params;
  const { addStock } = useInventory();

  const [quantityText, setQuantityText] = useState('');
  const [supplier, setSupplier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quantity = parseInt(quantityText, 10);
  const quantityIsValid = Number.isInteger(quantity) && quantity > 0;

  const handleSubmit = async (): Promise<void> => {
    if (!quantityIsValid || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await addStock({ stockId, quantity, supplier: supplier.trim() || undefined });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[stockInScreenStyles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={stockInScreenStyles.content} keyboardShouldPersistTaps="handled">
        <View style={stockInScreenStyles.productCard}>
          <Text style={stockInScreenStyles.productName}>{productName}</Text>
          <View style={stockInScreenStyles.statsRow}>
            <Text style={stockInScreenStyles.statLabel}>On hand</Text>
            <Text style={stockInScreenStyles.statValue}>{currentQuantity}</Text>
            <Text style={stockInScreenStyles.statDivider}>•</Text>
            <Text style={stockInScreenStyles.statLabel}>Reorder at</Text>
            <Text style={stockInScreenStyles.statValue}>{reorderLevel}</Text>
          </View>
        </View>

        <View style={stockInScreenStyles.formCard}>
          <Text style={stockInScreenStyles.inputLabel}>Quantity to add</Text>
          <InputField
            value={quantityText}
            onChangeText={setQuantityText}
            keyboardType="number-pad"
            placeholder="0"
            disabled={!quantityIsValid || isSubmitting}
          />

          <Text style={stockInScreenStyles.inputLabel}>Supplier (optional)</Text>
          <InputField
            value={supplier}
            onChangeText={setSupplier}
            placeholder="Supplier name"
            autoCapitalize="words"
            autoCorrect={false}
            disabled={isSubmitting}
          />
        </View>

        {error ? <Text style={stockInScreenStyles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            stockInScreenStyles.submitButton,
            pressed ? stockInScreenStyles.submitButtonPressed : null,
            !quantityIsValid || isSubmitting ? stockInScreenStyles.submitButtonDisabled : null,
          ]}
          disabled={!quantityIsValid || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={stockInScreenStyles.submitButtonText}>Add Stock</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
