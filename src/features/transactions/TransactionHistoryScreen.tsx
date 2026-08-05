import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { colors } from '../../theme';
import { TransactionsStackParamList } from './TransactionsNavigator';
import { useTransactions, TransactionRecord } from './useTransactions';
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

function formatDate(date: string): string {
  return new Date(date).toLocaleString();
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TransactionHistoryScreen({
  navigation,
  style,
}: TransactionHistoryScreenProps): React.JSX.Element {
  const { transactions, isLoading, error, loadTransactions } = useTransactions();

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions])
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
        <View style={transactionHistoryScreenStyles.itemHeader}>
          <View style={transactionHistoryScreenStyles.itemInfo}>
            <Text style={transactionHistoryScreenStyles.itemDate}>{formatDate(item.date)}</Text>
            <Text style={transactionHistoryScreenStyles.itemMeta}>
              {item.user_name} · {item.items_count} item(s)
            </Text>
          </View>
          <View style={transactionHistoryScreenStyles.modeBadge}>
            <Text style={transactionHistoryScreenStyles.modeBadgeText}>
              {PAYMENT_MODE_LABEL[item.payment_mode]}
            </Text>
          </View>
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
          {isVoided ? (
            <View style={transactionHistoryScreenStyles.voidedBadge}>
              <Text style={transactionHistoryScreenStyles.voidedBadgeText}>Voided</Text>
            </View>
          ) : (
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
    <View style={[transactionHistoryScreenStyles.container, style]}>
      {error ? <Text style={transactionHistoryScreenStyles.errorText}>{error}</Text> : null}
      <FlatList
        data={transactions}
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
    </View>
  );
}
