import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { ConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { TextField } from '../../components/common/TextField/TextField';
import { CategoryPickerModal } from '../../components/common/Category/CategoryPickerModal';
import { useCategories } from '../../components/common/Category/useCategories';
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
  const { categories, loadCategories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useProducts();
  const product = route.params?.product;
  const isEditing = product !== undefined;

  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [categoryName, setCategoryName] = useState(product?.category ?? '');
  const [priceText, setPriceText] = useState(product ? String(product.price) : '');
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories])
  );

  const price = parseFloat(priceText);
  const formIsValid = useMemo(
    () =>
      name.trim().length > 0 &&
      categoryId.trim().length > 0 &&
      Number.isFinite(price) &&
      price >= 0,
    [name, categoryId, price]
  );

  if (role !== 'admin') {
    return (
      <View style={[addEditProductScreenStyles.container, style]}>
        <Text style={addEditProductScreenStyles.errorText}>Admin access required</Text>
      </View>
    );
  }

  const handleSelectCategory = (id: string, nameOfCategory: string): void => {
    setCategoryId(id);
    setCategoryName(nameOfCategory);
    setCategoryPickerOpen(false);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formIsValid || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const payload = { name, category_id: categoryId, price, is_available: isAvailable };
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

  const handleDelete = async (): Promise<void> => {
    setDeleteConfirmOpen(false);
    if (isSubmitting || !product) return;
    try {
      await deleteProduct(product.product_id);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  return (
    <SafeAreaView style={[addEditProductScreenStyles.container, style]}>
      <View style={addEditProductScreenStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
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
            <Text style={addEditProductScreenStyles.sectionLabel}>Category</Text>
            <Pressable
              style={[
                addEditProductScreenStyles.categoryPicker,
                categoryPickerOpen ? addEditProductScreenStyles.categoryPickerActive : null,
              ]}
              onPress={() => setCategoryPickerOpen(true)}
            >
              <Text
                style={
                  categoryName
                    ? addEditProductScreenStyles.categoryPickerText
                    : addEditProductScreenStyles.categoryPickerPlaceholder
                }
              >
                {categoryName || 'Select a category'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </Pressable>
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
              onPress={() => setDeleteConfirmOpen(true)}
            >
              <Text style={addEditProductScreenStyles.deleteButtonText}>
                Delete Product
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPickerModal
        visible={categoryPickerOpen}
        categories={categories}
        selectedCategoryId={categoryId}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={handleSelectCategory}
      />

      <ConfirmDialog
        visible={deleteConfirmOpen}
        title="Delete product"
        message="Remove this product from the menu?"
        confirmLabel="Delete"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </SafeAreaView>
  );
}