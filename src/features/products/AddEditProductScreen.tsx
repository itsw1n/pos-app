import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Switch,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
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
  const { createProduct, updateProduct, deleteProduct } = useProducts();
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

  const handleDelete = (): void => {
    if (isSubmitting) return;
    Alert.alert('Delete product', 'Remove this product from the menu?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async (): Promise<void> => {
          if (!product) return;
          try {
            await deleteProduct(product.product_id);
            navigation.goBack();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete product');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[addEditProductScreenStyles.container, style]}>
      <View style={addEditProductScreenStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={addEditProductScreenStyles.topBarTitle}>
          {isEditing ? 'Edit' : 'Add'} Product
        </Text>
        <View style={addEditProductScreenStyles.topBarSpacer} />
      </View>

      <KeyboardAvoidingView
        style={addEditProductScreenStyles.keyboardView}
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
            <View style={addEditProductScreenStyles.availabilityRow}>
              <View style={addEditProductScreenStyles.availabilityTextBlock}>
                <Text style={addEditProductScreenStyles.availabilityTitle}>
                  Available on POS
                </Text>
                <Text style={addEditProductScreenStyles.availabilityCaption}>
                  Show this item on the POS menu
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </View>

          {error ? <Text style={addEditProductScreenStyles.errorText}>{error}</Text> : null}

          <Pressable
            style={[
              addEditProductScreenStyles.saveButton,
              !formIsValid || isSubmitting
                ? addEditProductScreenStyles.saveButtonDisabled
                : null,
            ]}
            disabled={!formIsValid || isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={addEditProductScreenStyles.saveButtonText}>
                {isEditing ? 'Save Changes' : 'Add Product'}
              </Text>
            )}
          </Pressable>

          {isEditing && product ? (
            <Pressable
              style={addEditProductScreenStyles.deleteButton}
              disabled={isSubmitting}
              onPress={handleDelete}
            >
              <Text style={addEditProductScreenStyles.deleteButtonText}>
                Delete Product
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}