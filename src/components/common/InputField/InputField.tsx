import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../../theme';
import { inputFieldStyles } from './InputField.styles';

export interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad'
    | 'decimal-pad'
    | 'visible-password';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiline?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: TextStyle;
  onSubmitEditing?: () => void;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize,
  autoCorrect,
  autoFocus = false,
  error,
  helperText,
  disabled = false,
  multiline = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  onSubmitEditing,
}: InputFieldProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const hasError = Boolean(error);

  const borderColor = hasError
    ? colors.danger
    : isFocused
      ? colors.primary
      : isHover
        ? colors.navActive
        : colors.border;
  const borderWidth = hasError || isFocused ? 2 : 1;

  const containerStyle: ViewStyle[] = [
    multiline
      ? inputFieldStyles.multilineContainer
      : inputFieldStyles.container,
    style,
    { borderColor, borderWidth },
    disabled && { backgroundColor: colors.background, opacity: 0.6 },
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={inputFieldStyles.root}>
      {label ? <Text style={inputFieldStyles.label}>{label}</Text> : null}
      <Pressable
        style={containerStyle}
        onHoverIn={() => setIsHover(true)}
        onHoverOut={() => setIsHover(false)}
        onPress={() => {}}
      >
        {leftIcon ? (
          <View style={inputFieldStyles.icon}>{leftIcon}</View>
        ) : null}
        <TextInput
          style={[
            multiline
              ? inputFieldStyles.inputMultiline
              : inputFieldStyles.input,
            inputStyle,
            disabled && inputFieldStyles.inputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          editable={!disabled}
          multiline={multiline}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          underlineColorAndroid="transparent"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
        />
        {rightIcon ? (
          <View style={[inputFieldStyles.icon, inputFieldStyles.iconAfter]}>
            {rightIcon}
          </View>
        ) : null}
      </Pressable>
      {hasError && error ? (
        <Text style={inputFieldStyles.errorText}>{error}</Text>
      ) : null}
      {helperText && !hasError ? (
        <Text style={inputFieldStyles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}
