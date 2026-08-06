import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { TextField } from '../../components/common/TextField/TextField';
import { colors } from '../../theme';
import { addCategoryModalStyles } from './AddCategoryModal.styles';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function AddCategoryModal({
  visible,
  onClose,
  onSubmit,
}: AddCategoryModalProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setError('');
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={addCategoryModalStyles.backdrop} onPress={onClose}>
        <Pressable style={addCategoryModalStyles.sheet} onPress={() => {}}>
          <Text style={addCategoryModalStyles.title}>New Category</Text>
          <TextField
            label="Category name"
            value={name}
            onChangeText={setName}
            autoFocus
            placeholder="e.g. Pastries"
            style={addCategoryModalStyles.field}
          />
          {error ? <Text style={addCategoryModalStyles.errorText}>{error}</Text> : null}
          <View style={addCategoryModalStyles.actions}>
            <Pressable
              style={addCategoryModalStyles.cancelButton}
              disabled={isSubmitting}
              onPress={onClose}
            >
              <Text style={addCategoryModalStyles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                addCategoryModalStyles.addButton,
                isSubmitting ? addCategoryModalStyles.addButtonDisabled : null,
              ]}
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              <Text style={addCategoryModalStyles.addButtonText}>
                {isSubmitting ? 'Adding…' : 'Add Category'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}