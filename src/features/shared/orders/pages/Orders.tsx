import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  GestureResponderEvent,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { PaymentBadge } from '@/components/common/PaymentBadge/PaymentBadge';
import { colors } from '@/theme';
import { UserRole } from '@/types/entities';
import { OrdersStackParamList } from '@/features/shared/orders/OrdersNavigator';
import {
  useOrders,
  TransactionRecord,
  TransactionItemRow,
} from '@/features/shared/orders/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { SearchBar } from '@/components/common/SearchBar/SearchBar';
import { DateFilterPicker } from '@/components/common/DateFilter/DateFilterPicker';
import {
  DateFilter,
  matchesDateFilter,
} from '@/components/common/DateFilter/types';
import { transactionHistoryScreenStyles as S } from './Orders.styles';

type OrdersProps = StackScreenProps<OrdersStackParamList, 'OrdersHome'> & {
  style?: StyleProp<ViewStyle>;
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

function transactionLabel(id: string): string {
  return `#TXN-${id.replace(/-/g, '').toUpperCase().slice(0, 8)}`;
}

const itemsCache = new Map<string, TransactionItemRow[]>();

const emptyItems: TransactionItemRow[] = [];

function useTransactionItems(
  transactionId: string,
  getTransactionItems: (id: string) => Promise<TransactionItemRow[]>,
): TransactionItemRow[] {
  const [items, setItems] = useState<TransactionItemRow[]>(
    () => itemsCache.get(transactionId) ?? emptyItems,
  );

  useEffect(() => {
    if (itemsCache.has(transactionId)) {
      return;
    }
    let active = true;
    void getTransactionItems(transactionId).then((resolved) => {
      if (!active) return;
      itemsCache.set(transactionId, resolved);
      setItems(resolved);
    });
    return () => {
      active = false;
    };
  }, [transactionId, getTransactionItems]);

  return items;
}

interface TransactionCardProps {
  item: TransactionRecord;
  role: UserRole | null;
  navigation: OrdersProps['navigation'];
  getTransactionItems: (id: string) => Promise<TransactionItemRow[]>;
}

function TransactionCard({
  item,
  role,
  navigation,
  getTransactionItems,
}: TransactionCardProps): React.JSX.Element {
  const isVoided = item.status === 'voided';

  const onPress = useCallback(() => {
    navigation.navigate('TransactionDetail', { transaction: item });
  }, [navigation, item]);

  const onVoid = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      navigation.navigate('Void', {
        transactionId: item.id,
        date: item.date,
        total: item.total_amount,
      });
    },
    [navigation, item],
  );

  const items = useTransactionItems(item.id, getTransactionItems);
  const summary =
    items.length > 0
      ? items.map((i) => `${i.product_name} x${i.quantity}`).join(', ')
      : `${item.items_count} item(s)`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[S.card, isVoided ? S.cardVoided : null]}
      onPress={onPress}
    >
      {/* ROW 1 */}
      <View style={S.row1}>
        <Text style={S.txnId}>{transactionLabel(item.id)}</Text>
        {isVoided ? (
          <View style={S.voidBadge}>
            <Text style={S.voidBadgeText}>VOIDED</Text>
          </View>
        ) : (
          <View style={S.row1Right}>
            <PaymentBadge mode={item.payment_mode} />
            <Text style={S.itemCount}>{item.items_count} item(s)</Text>
          </View>
        )}
      </View>

      {/* ROW 2 */}
      <Text style={S.itemDate}>{formatDate(item.date)}</Text>

      {/* ROW 3 */}
      <Text style={S.itemSummary} numberOfLines={1} ellipsizeMode="tail">
        {summary}
      </Text>

      <View style={S.divider} />

      {/* ROW 4 */}
      <View style={S.row4}>
        <Text style={[S.itemTotal, isVoided ? S.itemTotalVoided : null]}>
          {formatPeso(item.total_amount)}
        </Text>
        {!isVoided && role === 'admin' && (
          <Pressable
            style={({ pressed }) => [
              S.voidButton,
              pressed ? S.voidButtonPressed : null,
            ]}
            onPress={onVoid}
          >
            <Text style={S.voidButtonText}>Void</Text>
          </Pressable>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function Orders({ navigation, style }: OrdersProps): React.JSX.Element {
  const {
    transactions,
    isLoading,
    error,
    loadTransactions,
    getTransactionItems,
  } = useOrders();
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
  }): React.JSX.Element => (
    <TransactionCard
      item={item}
      role={role}
      navigation={navigation}
      getTransactionItems={getTransactionItems}
    />
  );

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[S.loadingContainer, style]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={S.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[S.container, style]}>
      <AppHeader pageTitle="Orders" />

      <SearchBar
        placeholder="Search by ID or user"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={S.searchBar}
      />

      <DateFilterPicker value={dateFilter} onChange={setDateFilter} />

      <View style={S.summaryBar}>
        <View style={S.summaryBlock}>
          <Text style={S.summaryLabel}>Total Sales</Text>
          <Text style={S.summaryValue}>{formatPeso(totalSales)}</Text>
        </View>
        <View style={S.summaryDivider} />
        <View style={S.summaryBlock}>
          <Text style={S.summaryLabel}>Transactions</Text>
          <Text style={S.summaryCount}>{filteredTransactions.length}</Text>
        </View>
      </View>

      {error ? <Text style={S.errorText}>{error}</Text> : null}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={S.emptyContainer}>
            <Text style={S.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
