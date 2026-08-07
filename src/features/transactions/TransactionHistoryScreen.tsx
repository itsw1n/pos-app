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
import { colors } from '../../theme';
import { TransactionsStackParamList } from './TransactionsNavigator';
import { useTransactions, TransactionRecord } from './useTransactions';
import { useAuth } from '../../context/AuthContext';
import { SearchBar } from '../../components/common/SearchBar/SearchBar';
import { transactionHistoryScreenStyles } from './TransactionHistoryScreen.styles';

type TransactionHistoryScreenProps = StackScreenProps<
  TransactionsStackParamList,
  'TransactionHistory'
> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_MODE_LABEL: Record<TransactionRecord['payment_mode'], string> = {
  cash: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
};

const DATE_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

type DateFilterKey = 'all' | 'today' | 'week' | 'month';

function formatDate(date: string): string {
  return new Date(date).toLocaleString();
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getDateBoundary(filter: DateFilterKey): number {
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === 'today') return day.getTime();
  if (filter === 'week') {
    const offset = (day.getDay() + 6) % 7;
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() - offset).getTime();
  }
  if (filter === 'month') return new Date(day.getFullYear(), day.getMonth(), 1).getTime();
  return 0;
}

export function TransactionHistoryScreen({
  navigation,
  style,
}: TransactionHistoryScreenProps): React.JSX.Element {
  const { transactions, isLoading, error, loadTransactions } = useTransactions();
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterKey>('all');

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions])
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const boundary = getDateBoundary(dateFilter);
    const dateFiltered =
      dateFilter === 'all' ? transactions : transactions.filter((item) => new Date(item.date).getTime() >= boundary);
    if (!query) return dateFiltered;
    return dateFiltered.filter(
      (item) => item.id.toLowerCase().includes(query) || item.user_name.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery, dateFilter]);

  const totalSales = useMemo(
    () => filteredTransactions.reduce((sum, item) => sum + item.total_amount, 0),
    [filteredTransactions]
  );

  const renderItem = ({ item }: { item: TransactionRecord }): React.JSX.Element => {
    const isVoided = item.status === 'voided';
    return (
      <View
        style={[
          transactionHistoryScreenStyles.itemCard,
          isVoided ? transactionHistoryScreenStyles.itemCardVoided : null,
        ]}
      >
        <View style={transactionHistoryScreenStyles.topRow}>
          <Text style={transactionHistoryScreenStyles.itemId}># {item.id.slice(-4)}</Text>
          <View style={transactionHistoryScreenStyles.modeBadge}>
            <Text style={transactionHistoryScreenStyles.modeBadgeText}>
              {PAYMENT_MODE_LABEL[item.payment_mode]}
            </Text>
          </View>
        </View>
        <View style={transactionHistoryScreenStyles.itemMetaRow}>
          <Text style={transactionHistoryScreenStyles.itemDate}>{formatDate(item.date)}</Text>
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
                <Text style={transactionHistoryScreenStyles.voidedBadgeText}>VOIDED</Text>
              </View>
            ) : (
              <>
                {role === 'admin' && (
                  <Pressable
                    style={({ pressed }) => [
                      transactionHistoryScreenStyles.voidButton,
                      pressed ? transactionHistoryScreenStyles.voidButtonPressed : null,
                    ]}
                    onPress={() =>
                      navigation.navigate('Void', {
                        transactionId: item.id,
                        date: item.date,
                        total: item.total_amount,
                      })
                    }
                  >
                    <Text style={transactionHistoryScreenStyles.voidButtonText}>Void</Text>
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
        <Text style={transactionHistoryScreenStyles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[transactionHistoryScreenStyles.container, style]}>
      <View style={transactionHistoryScreenStyles.topBar}>
        <Text style={transactionHistoryScreenStyles.topBarTitle}>Transactions</Text>
      </View>

      <SearchBar
        placeholder="Search by ID or user"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={transactionHistoryScreenStyles.searchBar}
      />

      <View style={transactionHistoryScreenStyles.filterTabs}>
        {DATE_FILTERS.map((filter) => {
          const isActive = filter.key === dateFilter;
          return (
            <Pressable
              key={filter.key}
              style={[
                transactionHistoryScreenStyles.filterTab,
                isActive ? transactionHistoryScreenStyles.filterTabActive : null,
              ]}
              onPress={() => setDateFilter(filter.key as DateFilterKey)}
            >
              <Text
                style={[
                  transactionHistoryScreenStyles.filterTabText,
                  isActive ? transactionHistoryScreenStyles.filterTabTextActive : null,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={transactionHistoryScreenStyles.summaryBar}>
        <View style={transactionHistoryScreenStyles.summaryBlock}>
          <Text style={transactionHistoryScreenStyles.summaryLabel}>Total Sales</Text>
          <Text style={transactionHistoryScreenStyles.summaryValue}>
            {formatPeso(totalSales)}
          </Text>
        </View>
        <View style={transactionHistoryScreenStyles.summaryDivider} />
        <View style={transactionHistoryScreenStyles.summaryBlock}>
          <Text style={transactionHistoryScreenStyles.summaryLabel}>Transactions</Text>
          <Text style={transactionHistoryScreenStyles.summaryCount}>
            {filteredTransactions.length}
          </Text>
        </View>
      </View>

      {error ? <Text style={transactionHistoryScreenStyles.errorText}>{error}</Text> : null}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={transactionHistoryScreenStyles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={transactionHistoryScreenStyles.emptyContainer}>
            <Text style={transactionHistoryScreenStyles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}