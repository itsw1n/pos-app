import React from 'react';
import {
  KeyboardTypeOptions,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../../theme';
import { textFieldStyles } from './TextField.styles';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  placeholder,
  autoCapitalize,
  autoCorrect,
  style,
}: TextFieldProps): React.JSX.Element {
  return (
    <View style={[textFieldStyles.root, style]}>
      <Text style={textFieldStyles.label}>{label}</Text>
      <TextInput
        style={[
          textFieldStyles.input,
          error ? textFieldStyles.inputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {error ? <Text style={textFieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}
