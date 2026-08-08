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
import { InputField } from '@/components/common/InputField/InputField';
import { colors } from '@/theme';
import { ReportsStackParamList } from '@/features/admin/reports/ReportsNavigator';
import { useInventory } from '@/hooks/useInventory';
import { stockInStyles } from './StockIn.styles';

type StockInProps = StackScreenProps<ReportsStackParamList, 'StockIn'> & {
  style?: StyleProp<ViewStyle>;
};

export function StockIn({
  navigation,
  route,
  style,
}: StockInProps): React.JSX.Element {
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
      await addStock({
        stockId,
        quantity,
        supplier: supplier.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[stockInStyles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={stockInStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={stockInStyles.productCard}>
          <Text style={stockInStyles.productName}>{productName}</Text>
          <View style={stockInStyles.statsRow}>
            <Text style={stockInStyles.statLabel}>On hand</Text>
            <Text style={stockInStyles.statValue}>{currentQuantity}</Text>
            <Text style={stockInStyles.statDivider}>•</Text>
            <Text style={stockInStyles.statLabel}>Reorder at</Text>
            <Text style={stockInStyles.statValue}>{reorderLevel}</Text>
          </View>
        </View>

        <View style={stockInStyles.formCard}>
          <Text style={stockInStyles.inputLabel}>Quantity to add</Text>
          <InputField
            value={quantityText}
            onChangeText={setQuantityText}
            keyboardType="number-pad"
            placeholder="0"
            disabled={isSubmitting}
          />

          <Text style={stockInStyles.inputLabel}>Supplier (optional)</Text>
          <InputField
            value={supplier}
            onChangeText={setSupplier}
            placeholder="Supplier name"
            autoCapitalize="words"
            autoCorrect={false}
            disabled={isSubmitting}
          />
        </View>

        {error ? <Text style={stockInStyles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            stockInStyles.submitButton,
            pressed ? stockInStyles.submitButtonPressed : null,
            !quantityIsValid || isSubmitting
              ? stockInStyles.submitButtonDisabled
              : null,
          ]}
          disabled={!quantityIsValid || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={stockInStyles.submitButtonText}>Add Stock</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
