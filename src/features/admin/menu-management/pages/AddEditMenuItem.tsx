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
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { TextField } from '@/components/common/TextField/TextField';
import { CategoryPickerModal } from '@/components/common/Category/CategoryPickerModal';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/context/AuthContext';
import { toErrorMessage } from '@/services/errors';
import { colors } from '@/theme';
import { MenuManagementStackParamList } from '@/features/admin/menu-management/MenuManagementNavigator';
import { useMenuManagement } from '@/features/admin/menu-management/hooks/useMenuManagement';
import { addEditMenuItemStyles } from './AddEditMenuItem.styles';

type AddEditMenuItemProps = StackScreenProps<
  MenuManagementStackParamList,
  'AddEditMenuItem'
> & {
  style?: StyleProp<ViewStyle>;
};

export function AddEditMenuItem({
  navigation,
  route,
  style,
}: AddEditMenuItemProps): React.JSX.Element {
  const { role } = useAuth();
  const { categories, loadCategories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useMenuManagement();
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
      void loadCategories(true);
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
      <View style={[addEditMenuItemStyles.container, style]}>
        <Text style={addEditMenuItemStyles.errorText}>Admin access required</Text>
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
      setError(toErrorMessage(err, 'Failed to save product'));
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
      setError(toErrorMessage(err, 'Failed to delete product'));
    }
  };

  return (
    <SafeAreaView style={[addEditMenuItemStyles.container, style]}>
      <View style={addEditMenuItemStyles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={addEditMenuItemStyles.topBarTitle}>
          {isEditing ? 'Edit' : 'Add'} Product
        </Text>
        <View style={addEditMenuItemStyles.topBarSpacer} />
      </View>

      <KeyboardAvoidingView
        style={addEditMenuItemStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={addEditMenuItemStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={addEditMenuItemStyles.formCard}>
            <TextField
              label="Name"
              value={name}
              onChangeText={setName}
              style={addEditMenuItemStyles.fieldSpacing}
            />
            <Text style={addEditMenuItemStyles.sectionLabel}>Category</Text>
            <Pressable
              style={[
                addEditMenuItemStyles.categoryPicker,
                categoryPickerOpen ? addEditMenuItemStyles.categoryPickerActive : null,
              ]}
              onPress={() => setCategoryPickerOpen(true)}
            >
              <Text
                style={
                  categoryName
                    ? addEditMenuItemStyles.categoryPickerText
                    : addEditMenuItemStyles.categoryPickerPlaceholder
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
              style={addEditMenuItemStyles.fieldSpacing}
            />

            <Text style={addEditMenuItemStyles.sectionLabel}>Availability</Text>
            <View style={addEditMenuItemStyles.availabilityRow}>
              <View style={addEditMenuItemStyles.availabilityTextBlock}>
                <Text style={addEditMenuItemStyles.availabilityTitle}>
                  Available on POS
                </Text>
                <Text style={addEditMenuItemStyles.availabilityCaption}>
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

          {error ? <Text style={addEditMenuItemStyles.errorText}>{error}</Text> : null}

          <Pressable
            style={[
              addEditMenuItemStyles.saveButton,
              !formIsValid || isSubmitting
                ? addEditMenuItemStyles.saveButtonDisabled
                : null,
            ]}
            disabled={!formIsValid || isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={addEditMenuItemStyles.saveButtonText}>
                {isEditing ? 'Save Changes' : 'Add Product'}
              </Text>
            )}
          </Pressable>

          {isEditing && product ? (
            <Pressable
              style={addEditMenuItemStyles.deleteButton}
              disabled={isSubmitting}
              onPress={() => setDeleteConfirmOpen(true)}
            >
              <Text style={addEditMenuItemStyles.deleteButtonText}>
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