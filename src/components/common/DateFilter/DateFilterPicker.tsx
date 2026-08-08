import { CalendarDays, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../../theme';
import { DateFilter } from './types';
import { DateFilterPickerModal } from './DateFilterPickerModal';
import { dateFilterPickerStyles } from './DateFilterPicker.styles';

interface DateFilterPickerProps {
  value: DateFilter;
  onChange: (filter: DateFilter) => void;
  style?: StyleProp<ViewStyle>;
  allowAll?: boolean;
}

const DATE_LABEL_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, DATE_LABEL_OPTIONS);
}

function formatDateFilter(filter: DateFilter): string {
  switch (filter.type) {
    case 'all':
      return 'Select dates';
    case 'single':
      return formatDate(filter.date);
    case 'range':
      return `${formatDate(filter.from)} – ${formatDate(filter.to)}`;
  }
}

export function DateFilterPicker({
  value,
  onChange,
  style,
  allowAll = true,
}: DateFilterPickerProps): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);

  const isAll = value.type === 'all';

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);
  const clearFilter = useCallback(() => onChange({ type: 'all' }), [onChange]);

  return (
    <View style={[dateFilterPickerStyles.row, style]}>
      {allowAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show all dates"
          style={[
            dateFilterPickerStyles.chip,
            isAll ? dateFilterPickerStyles.chipActive : null,
          ]}
          onPress={clearFilter}
        >
          <Text
            style={[
              dateFilterPickerStyles.chipText,
              isAll ? dateFilterPickerStyles.chipTextActive : null,
            ]}
          >
            All
          </Text>
        </Pressable>
      ) : null}

      <View
        style={[
          dateFilterPickerStyles.chip,
          !isAll ? dateFilterPickerStyles.chipActive : null,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select date filter"
          style={dateFilterPickerStyles.chipMain}
          onPress={openModal}
        >
          <CalendarDays
            size={14}
            color={isAll ? colors.textSecondary : colors.surface}
          />
          <Text
            numberOfLines={1}
            style={[
              dateFilterPickerStyles.chipText,
              dateFilterPickerStyles.chipTextFlex,
              !isAll ? dateFilterPickerStyles.chipTextActive : null,
            ]}
          >
            {formatDateFilter(value)}
          </Text>
        </Pressable>
        {!isAll && allowAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear date filter"
            hitSlop={8}
            style={dateFilterPickerStyles.chipClear}
            onPress={clearFilter}
          >
            <X size={14} color={colors.surface} />
          </Pressable>
        ) : null}
      </View>

      <DateFilterPickerModal
        visible={modalVisible}
        value={value}
        onChange={onChange}
        onClose={closeModal}
        allowAll={allowAll}
      />
    </View>
  );
}
