import {
  Calendar,
  CalendarActiveDateRange,
  CalendarTheme,
  toDateId,
} from '@marceloterreiro/flash-calendar';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from '../Button/Button';
import { colors, typography } from '../../../theme';
import { DateFilter, fromDateKey, startOfDay, toDateKey } from './types';
import { dateFilterPickerModalStyles } from './DateFilterPickerModal.styles';

interface DateFilterPickerModalProps {
  visible: boolean;
  value: DateFilter;
  onChange: (filter: DateFilter) => void;
  onClose: () => void;
  allowAll?: boolean;
}

const calendarTheme: CalendarTheme = {
  rowMonth: {
    container: {
      height: 0,
      overflow: 'hidden',
    },
  },
  itemDay: {
    base: () => ({
      container: {},
      content: {
        fontFamily: typography.md.fontFamily,
        fontSize: typography.md.fontSize,
        color: colors.textPrimary,
      },
    }),
    idle: () => ({
      container: {
        backgroundColor: colors.surface,
      },
    }),
    today: () => ({
      container: {
        backgroundColor: colors.iconCircle,
      },
      content: {
        color: colors.primary,
        fontWeight: '600',
      },
    }),
    active: () => ({
      container: {
        backgroundColor: colors.primary,
      },
      content: {
        color: colors.surface,
      },
    }),
    disabled: () => ({
      container: {
        backgroundColor: colors.surface,
      },
      content: {
        color: colors.disabled,
      },
    }),
  },
  itemDayContainer: {
    activeDayFiller: {
      backgroundColor: colors.navActive,
    },
  },
};

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function initialMonth(value: DateFilter): Date {
  const base =
    value.type === 'all'
      ? new Date()
      : value.type === 'single'
        ? value.date
        : value.from;
  return new Date(base.getFullYear(), base.getMonth(), 1);
}

function isCurrentMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function getHintText(
  value: DateFilter,
  anchor: Date | null,
  allowAll: boolean,
): string {
  if (anchor !== null) return 'Tap another date to complete the range.';
  if (value.type === 'single') {
    return allowAll
      ? 'Tap the date again to clear, or pick a second date for a range.'
      : 'Tap another date to create a range.';
  }
  if (value.type === 'range')
    return 'Range selected. Tap a date to start a new selection.';
  return 'Tap a date for a single day, then a second date for a range.';
}

function CalendarSection({
  value,
  onChange,
  onClose,
  allowAll,
}: Omit<DateFilterPickerModalProps, 'visible'>): React.JSX.Element {
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [monthDate, setMonthDate] = useState<Date>(() => initialMonth(value));

  const monthLabel = useMemo(
    () =>
      monthDate.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [monthDate],
  );

  const canGoNext = !isCurrentMonth(monthDate);

  const goToPreviousMonth = useCallback(() => {
    setMonthDate((current) => shiftMonth(current, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonthDate((current) => shiftMonth(current, 1));
  }, []);

  const activeDateRanges = useMemo<CalendarActiveDateRange[]>(() => {
    if (anchor !== null) {
      const id = toDateKey(anchor);
      return [{ startId: id, endId: id }];
    }
    if (value.type === 'single') {
      const id = toDateKey(value.date);
      return [{ startId: id, endId: id }];
    }
    if (value.type === 'range') {
      return [{ startId: toDateKey(value.from), endId: toDateKey(value.to) }];
    }
    return [];
  }, [anchor, value]);

  const handleDayPress = useCallback(
    (dateId: string) => {
      const day = fromDateKey(dateId);
      if (anchor === null) {
        if (value.type === 'single' && sameDay(day, value.date)) {
          if (allowAll) onChange({ type: 'all' });
          setAnchor(null);
          return;
        }
        setAnchor(day);
        onChange({ type: 'single', date: day });
        return;
      }
      if (sameDay(day, anchor)) {
        setAnchor(null);
        if (allowAll) onChange({ type: 'all' });
        return;
      }
      const from = startOfDay(day) < startOfDay(anchor) ? day : anchor;
      const to = startOfDay(day) < startOfDay(anchor) ? anchor : day;
      setAnchor(null);
      onChange({ type: 'range', from, to });
    },
    [anchor, onChange, allowAll, value],
  );

  return (
    <View>
      <View style={dateFilterPickerModalStyles.header}>
        <Text style={dateFilterPickerModalStyles.title}>Select dates</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={dateFilterPickerModalStyles.closeButton}
          onPress={onClose}
        >
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={dateFilterPickerModalStyles.monthNav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={8}
          style={dateFilterPickerModalStyles.monthNavButton}
          onPress={goToPreviousMonth}
        >
          <ChevronLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={dateFilterPickerModalStyles.monthNavLabel}>
          {monthLabel}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          disabled={!canGoNext}
          hitSlop={8}
          style={[
            dateFilterPickerModalStyles.monthNavButton,
            !canGoNext
              ? dateFilterPickerModalStyles.monthNavButtonDisabled
              : null,
          ]}
          onPress={goToNextMonth}
        >
          <ChevronRight
            size={20}
            color={canGoNext ? colors.textPrimary : colors.disabled}
          />
        </Pressable>
      </View>

      <Calendar
        calendarMonthId={toDateKey(monthDate)}
        calendarMonthHeaderHeight={0}
        calendarMaxDateId={toDateId(new Date())}
        calendarActiveDateRanges={activeDateRanges}
        onCalendarDayPress={handleDayPress}
        calendarFirstDayOfWeek="sunday"
        calendarDayHeight={40}
        calendarRowVerticalSpacing={4}
        calendarRowHorizontalSpacing={8}
        calendarColorScheme="light"
        theme={calendarTheme}
      />

      <Text style={dateFilterPickerModalStyles.hint}>
        {getHintText(value, anchor, allowAll ?? true)}
      </Text>

      <Button
        size="medium"
        style={dateFilterPickerModalStyles.doneButton}
        onPress={onClose}
      >
        Done
      </Button>
    </View>
  );
}

export function DateFilterPickerModal({
  visible,
  value,
  onChange,
  onClose,
  allowAll = true,
}: DateFilterPickerModalProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={dateFilterPickerModalStyles.backdrop} onPress={onClose}>
        <View
          style={dateFilterPickerModalStyles.sheet}
          onStartShouldSetResponder={() => true}
        >
          {visible ? (
            <CalendarSection
              value={value}
              onChange={onChange}
              onClose={onClose}
              allowAll={allowAll}
            />
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}
