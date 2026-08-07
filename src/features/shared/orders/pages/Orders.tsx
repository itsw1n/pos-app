import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { colors } from '@/theme';
import { OrdersStackParamList } from '@/features/shared/orders/OrdersNavigator';
import {
  useOrders,
  TransactionRecord,
} from '@/features/shared/orders/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { SearchBar } from '@/components/common/SearchBar/SearchBar';
import { DateFilterPicker } from '@/components/common/DateFilter/DateFilterPicker';
import {
  DateFilter,
  matchesDateFilter,
} from '@/components/common/DateFilter/types';
import { transactionHistoryScreenStyles } from './Orders.styles';

type OrdersProps = StackScreenProps<OrdersStackParamList, 'OrdersHome'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_MODE_LABEL: Record<TransactionRecord['payment_mode'], string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleString();
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function Orders({ navigation, style }: OrdersProps): React.JSX.Element {
  const { transactions, isLoading, error, loadTransactions } = useOrders();
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions]),
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const dateFiltered = transactions.filter((item) =>
      matchesDateFilter(dateFilter, new Date(item.date)),
    );
    if (!query) return dateFiltered;
    return dateFiltered.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.user_name.toLowerCase().includes(query),
    );
  }, [transactions, searchQuery, dateFilter]);

  const totalSales = useMemo(
    () =>
      filteredTransactions.reduce((sum, item) => sum + item.total_amount, 0),
    [filteredTransactions],
  );

  const renderItem = ({
    item,
  }: {
    item: TransactionRecord;
  }): React.JSX.Element => {
    const isVoided = item.status === 'voided';
    return (
      <View
        style={[
          transactionHistoryScreenStyles.itemCard,
          isVoided ? transactionHistoryScreenStyles.itemCardVoided : null,
        ]}
      >
        <View style={transactionHistoryScreenStyles.topRow}>
          <Text style={transactionHistoryScreenStyles.itemId}>
            # {item.id.slice(-4)}
          </Text>
          <View style={transactionHistoryScreenStyles.modeBadge}>
            <Text style={transactionHistoryScreenStyles.modeBadgeText}>
              {PAYMENT_MODE_LABEL[item.payment_mode]}
            </Text>
          </View>
        </View>
        <View style={transactionHistoryScreenStyles.itemMetaRow}>
          <Text style={transactionHistoryScreenStyles.itemDate}>
            {formatDate(item.date)}
          </Text>
          <Text style={transactionHistoryScreenStyles.itemCount}>
            {item.items_count} item(s)
          </Text>
        </View>
        <View style={transactionHistoryScreenStyles.itemFooter}>
          <Text
            style={[
              transactionHistoryScreenStyles.itemTotal,
              isVoided ? transactionHistoryScreenStyles.itemTotalVoided : null,
            ]}
          >
            {formatPeso(item.total_amount)}
          </Text>
          <View style={transactionHistoryScreenStyles.itemActions}>
            {isVoided ? (
              <View style={transactionHistoryScreenStyles.voidedBadge}>
                <Text style={transactionHistoryScreenStyles.voidedBadgeText}>
                  VOIDED
                </Text>
              </View>
            ) : (
              <>
                {role === 'admin' && (
                  <Pressable
                    style={({ pressed }) => [
                      transactionHistoryScreenStyles.voidButton,
                      pressed
                        ? transactionHistoryScreenStyles.voidButtonPressed
                        : null,
                    ]}
                    onPress={() =>
                      navigation.navigate('Void', {
                        transactionId: item.id,
                        date: item.date,
                        total: item.total_amount,
                      })
                    }
                  >
                    <Text style={transactionHistoryScreenStyles.voidButtonText}>
                      Void
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[transactionHistoryScreenStyles.loadingContainer, style]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={transactionHistoryScreenStyles.loadingText}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[transactionHistoryScreenStyles.container, style]}>
      <AppHeader pageTitle="Orders" />

      <SearchBar
        placeholder="Search by ID or user"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={transactionHistoryScreenStyles.searchBar}
      />

      <DateFilterPicker value={dateFilter} onChange={setDateFilter} />

      <View style={transactionHistoryScreenStyles.summaryBar}>
        <View style={transactionHistoryScreenStyles.summaryBlock}>
          <Text style={transactionHistoryScreenStyles.summaryLabel}>
            Total Sales
          </Text>
          <Text style={transactionHistoryScreenStyles.summaryValue}>
            {formatPeso(totalSales)}
          </Text>
        </View>
        <View style={transactionHistoryScreenStyles.summaryDivider} />
        <View style={transactionHistoryScreenStyles.summaryBlock}>
          <Text style={transactionHistoryScreenStyles.summaryLabel}>
            Transactions
          </Text>
          <Text style={transactionHistoryScreenStyles.summaryCount}>
            {filteredTransactions.length}
          </Text>
        </View>
      </View>

      {error ? (
        <Text style={transactionHistoryScreenStyles.errorText}>{error}</Text>
      ) : null}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={transactionHistoryScreenStyles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={transactionHistoryScreenStyles.emptyContainer}>
            <Text style={transactionHistoryScreenStyles.emptyText}>
              No transactions yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
