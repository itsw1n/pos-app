import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors } from '../../../theme';
import { InputField } from '../InputField/InputField';
import { searchBarStyles } from './SearchBar.styles';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  disabled,
  style,
}: SearchBarProps): React.JSX.Element {
  return (
    <InputField
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      autoCorrect={false}
      disabled={disabled}
      leftIcon={<Search size={18} color={colors.textSecondary} />}
      rightIcon={<SlidersHorizontal size={18} color={colors.textSecondary} />}
      style={[searchBarStyles.container, style]}
    />
  );
}
