import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { buttonStyles } from './Button.styles';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'disabled' | 'onPress'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const variantContainerStyles: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  primary: buttonStyles.variantPrimary,
  secondary: buttonStyles.variantSecondary,
  outline: buttonStyles.variantOutline,
  danger: buttonStyles.variantDanger,
};

const variantLabelStyles: Record<ButtonVariant, StyleProp<TextStyle>> = {
  primary: buttonStyles.labelPrimary,
  secondary: buttonStyles.labelSecondary,
  outline: buttonStyles.labelOutline,
  danger: buttonStyles.labelDanger,
};

const sizeContainerStyles: Record<ButtonSize, StyleProp<ViewStyle>> = {
  small: buttonStyles.sizeSmall,
  medium: buttonStyles.sizeMedium,
  large: buttonStyles.sizeLarge,
};

const sizeLabelStyles: Record<ButtonSize, StyleProp<TextStyle>> = {
  small: buttonStyles.labelSmall,
  medium: buttonStyles.labelMedium,
  large: buttonStyles.labelLarge,
};

export function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  children,
  style,
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyles.root,
        variantContainerStyles[variant],
        sizeContainerStyles[size],
        disabled ? buttonStyles.disabled : null,
        pressed && !disabled ? buttonStyles.pressed : null,
        style,
      ]}
    >
      <Text
        style={[
          buttonStyles.label,
          sizeLabelStyles[size],
          variantLabelStyles[variant],
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
