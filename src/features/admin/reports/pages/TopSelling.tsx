import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DateFilterPicker } from '@/components/common/DateFilter/DateFilterPicker';
import { DateFilter } from '@/components/common/DateFilter/types';
import { colors } from '@/theme';
import {
  useReports,
  TopProduct,
} from '@/features/admin/reports/hooks/useReports';
import { topSellingStyles as S } from './TopSelling.styles';

interface TopSellingProps {
  style?: StyleProp<ViewStyle>;
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TopProductRow({
  rank,
  product,
}: {
  rank: number;
  product: TopProduct;
}): React.JSX.Element {
  return (
    <View style={S.listRow}>
      <View style={S.rankTile}>
        <Text style={S.rankText}>{rank}</Text>
      </View>
      <View style={S.itemInfo}>
        <Text style={S.rowName} numberOfLines={1}>
          {product.product_name}
        </Text>
        <Text style={S.rowMeta}>{product.quantity_sold} sold</Text>
      </View>
      <Text style={S.rowValue}>{formatPeso(product.revenue)}</Text>
    </View>
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function filterToRange(filter: DateFilter): { start?: Date; end?: Date } {
  switch (filter.type) {
    case 'all':
      return {};
    case 'single':
      return { start: startOfDay(filter.date), end: endOfDay(filter.date) };
    case 'range':
      return {
        start: startOfDay(filter.from),
        end: endOfDay(filter.to),
      };
  }
}

export function TopSelling({ style }: TopSellingProps): React.JSX.Element {
  const { getTopProducts } = useReports();
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTopProducts = useCallback(
    async (filter: DateFilter): Promise<void> => {
      setIsLoading(true);
      setError('');
      try {
        const { start, end } = filterToRange(filter);
        const products = await getTopProducts(start, end);
        setTopProducts(products);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load top selling',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getTopProducts],
  );

  useFocusEffect(
    useCallback(() => {
      void loadTopProducts(dateFilter);
    }, [loadTopProducts, dateFilter]),
  );

  return (
    <SafeAreaView style={[S.container, style]}>
      <DateFilterPicker
        style={S.filterRow}
        value={dateFilter}
        onChange={setDateFilter}
      />

      {error ? <Text style={S.errorText}>{error}</Text> : null}

      {isLoading && topProducts.length === 0 ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={S.loadingText}>Loading top selling...</Text>
        </View>
      ) : topProducts.length > 0 ? (
        <View style={S.content}>
          {topProducts.map((product, index) => (
            <TopProductRow
              key={product.product_id}
              rank={index + 1}
              product={product}
            />
          ))}
        </View>
      ) : (
        <View style={S.emptyContainer}>
          <Text style={S.emptyText}>
            No sales recorded for the selected dates
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
