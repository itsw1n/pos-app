import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, RefreshCw, Trash2 } from 'lucide-react-native';
import { ProductImageFile } from '@/api/storageApi';
import { colors } from '@/theme';
import { imagePickerFieldStyles } from './ImagePickerField.styles';

export interface PickedImage {
  uri: string;
  file: ProductImageFile;
}

export interface ImagePickerFieldProps {
  initialUrl?: string | null;
  onChange: (picked: PickedImage | null) => void;
  placeholder?: string;
}

export function ImagePickerField({
  initialUrl,
  onChange,
  placeholder = 'Add a product photo (optional)',
}: ImagePickerFieldProps): React.JSX.Element {
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');

  const currentUri = removed ? null : (pickedUri ?? initialUrl ?? null);

  const handlePick = useCallback(async (): Promise<void> => {
    setError('');
    setPicking(true);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Photo library access is required to add an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      const file: ProductImageFile = {
        base64: asset.base64 ?? '',
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? 'product-image',
      };
      setPickedUri(asset.uri);
      setRemoved(false);
      onChange({ uri: asset.uri, file });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pick an image');
    } finally {
      setPicking(false);
    }
  }, [onChange]);

  const handleRemove = useCallback((): void => {
    setPickedUri(null);
    setRemoved(true);
    setError('');
    onChange(null);
  }, [onChange]);

  return (
    <View style={imagePickerFieldStyles.wrapper}>
      <Text style={imagePickerFieldStyles.label}>Product photo</Text>

      {currentUri ? (
        <View style={imagePickerFieldStyles.previewRow}>
          <View style={imagePickerFieldStyles.previewTile}>
            <Image
              source={{ uri: currentUri }}
              style={imagePickerFieldStyles.previewImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          </View>
          <View style={imagePickerFieldStyles.previewActions}>
            <Pressable
              style={imagePickerFieldStyles.actionButton}
              onPress={() => void handlePick()}
              disabled={picking}
            >
              {picking ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <RefreshCw size={16} color={colors.primary} />
                  <Text style={imagePickerFieldStyles.actionText}>
                    Change photo
                  </Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={imagePickerFieldStyles.actionButton}
              onPress={handleRemove}
            >
              <Trash2 size={16} color={colors.danger} />
              <Text
                style={[
                  imagePickerFieldStyles.actionText,
                  imagePickerFieldStyles.actionTextDanger,
                ]}
              >
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={imagePickerFieldStyles.addButton}
          onPress={() => void handlePick()}
          disabled={picking}
        >
          {picking ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <View style={imagePickerFieldStyles.addIconCircle}>
                <Camera size={18} color={colors.primary} />
              </View>
              <Text style={imagePickerFieldStyles.addText}>{placeholder}</Text>
            </>
          )}
        </Pressable>
      )}

      {error ? (
        <Text style={imagePickerFieldStyles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}
