import React, { useMemo, useState } from 'react';
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
import { Button } from '../../components/common/Button/Button';
import { TextField } from '../../components/common/TextField/TextField';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { ProductsStackParamList } from './ProductsNavigator';
import { useProducts } from './useProducts';
import { addEditProductScreenStyles } from './AddEditProductScreen.styles';

type AddEditProductScreenProps = StackScreenProps<
  ProductsStackParamList,
  'AddEditProduct'
> & {
  style?: StyleProp<ViewStyle>;
};

export function AddEditProductScreen({
  navigation,
  route,
  style,
}: AddEditProductScreenProps): React.JSX.Element {
  const { role } = useAuth();
  const { createProduct, updateProduct } = useProducts();
  const product = route.params?.product;
  const isEditing = product !== undefined;

  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [priceText, setPriceText] = useState(
    product ? String(product.price) : ''
  );
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const price = parseFloat(priceText);
  const formIsValid = useMemo(
    () =>
      name.trim().length > 0 &&
      category.trim().length > 0 &&
      Number.isFinite(price) &&
      price >= 0,
    [name, category, price]
  );

  if (role !== 'admin') {
    return (
      <View style={[addEditProductScreenStyles.container, style]}>
        <Text style={addEditProductScreenStyles.errorText}>Admin access required</Text>
      </View>
    );
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formIsValid || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const payload = { name, category, price, is_available: isAvailable };
      if (isEditing && product) {
        await updateProduct(product.product_id, payload);
      } else {
        await createProduct(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[addEditProductScreenStyles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={addEditProductScreenStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={addEditProductScreenStyles.formCard}>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            style={addEditProductScreenStyles.fieldSpacing}
          />
          <TextField
            label="Category"
            value={category}
            onChangeText={setCategory}
            style={addEditProductScreenStyles.fieldSpacing}
          />
          <TextField
            label="Price"
            value={priceText}
            onChangeText={setPriceText}
            keyboardType="decimal-pad"
            style={addEditProductScreenStyles.fieldSpacing}
          />

          <Text style={addEditProductScreenStyles.sectionLabel}>Availability</Text>
          <View style={addEditProductScreenStyles.toggleRow}>
            <Pressable
              style={[
                addEditProductScreenStyles.toggleOption,
                addEditProductScreenStyles.toggleOptionLeft,
                isAvailable ? addEditProductScreenStyles.toggleOptionActive : null,
              ]}
              onPress={() => setIsAvailable(true)}
            >
              <Text
                style={[
                  addEditProductScreenStyles.toggleOptionText,
                  isAvailable ? addEditProductScreenStyles.toggleOptionTextActive : null,
                ]}
              >
                Available
              </Text>
            </Pressable>
            <Pressable
              style={[
                addEditProductScreenStyles.toggleOption,
                addEditProductScreenStyles.toggleOptionRight,
                !isAvailable ? addEditProductScreenStyles.toggleOptionActive : null,
              ]}
              onPress={() => setIsAvailable(false)}
            >
              <Text
                style={[
                  addEditProductScreenStyles.toggleOptionText,
                  !isAvailable ? addEditProductScreenStyles.toggleOptionTextActive : null,
                ]}
              >
                Unavailable
              </Text>
            </Pressable>
          </View>
        </View>

        {error ? <Text style={addEditProductScreenStyles.errorText}>{error}</Text> : null}

        <Button
          variant="primary"
          size="large"
          disabled={!formIsValid || isSubmitting}
          onPress={handleSubmit}
          style={addEditProductScreenStyles.submitButton}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Add Product'
          )}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
