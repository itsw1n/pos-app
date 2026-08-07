import React from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { confirmDialogStyles } from './ConfirmDialog.styles';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
  style,
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={[confirmDialogStyles.backdrop, style]}
        onPress={onCancel}
      >
        <Pressable style={confirmDialogStyles.sheet} onPress={() => {}}>
          <Text style={confirmDialogStyles.title}>{title}</Text>
          <Text style={confirmDialogStyles.message}>{message}</Text>
          <View style={confirmDialogStyles.actions}>
            <Pressable
              style={confirmDialogStyles.cancelButton}
              disabled={isLoading}
              onPress={onCancel}
            >
              <Text style={confirmDialogStyles.cancelButtonText}>
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              style={[
                confirmDialogStyles.confirmButton,
                destructive
                  ? confirmDialogStyles.confirmButtonDestructive
                  : null,
                isLoading ? confirmDialogStyles.confirmButtonDisabled : null,
              ]}
              disabled={isLoading}
              onPress={onConfirm}
            >
              <Text style={confirmDialogStyles.confirmButtonText}>
                {isLoading ? 'Working…' : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
