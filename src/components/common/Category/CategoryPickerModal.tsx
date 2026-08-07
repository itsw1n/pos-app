import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../../../theme';
import { Category } from '../../../types/entities';
import { categoryPickerModalStyles } from './CategoryPickerModal.styles';

interface CategoryPickerModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryId?: string;
  onClose: () => void;
  onSelect: (categoryId: string, name: string) => void;
}

export function CategoryPickerModal({
  visible,
  categories,
  selectedCategoryId,
  onClose,
  onSelect,
}: CategoryPickerModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={categoryPickerModalStyles.backdrop} onPress={onClose}>
        <View style={categoryPickerModalStyles.sheet}>
          <Text style={categoryPickerModalStyles.title}>Select Category</Text>
          <ScrollView style={categoryPickerModalStyles.list}>
            {categories.map((category) => {
              const isSelected = category.category_id === selectedCategoryId;
              return (
                <Pressable
                  key={category.category_id}
                  style={categoryPickerModalStyles.option}
                  onPress={() => onSelect(category.category_id, category.name)}
                >
                  <Text
                    style={[
                      categoryPickerModalStyles.optionText,
                      isSelected ? categoryPickerModalStyles.optionTextSelected : null,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {isSelected ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}