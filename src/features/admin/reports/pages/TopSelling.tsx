import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { colors } from '@/theme';
import {
  useReports,
  getPeriodRange,
  ReportPeriod,
  TopProduct,
} from '@/features/admin/reports/hooks/useReports';
import { topSellingStyles as S } from './TopSelling.styles';

interface TopSellingProps {
  style?: StyleProp<ViewStyle>;
}

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

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

export function TopSelling({ style }: TopSellingProps): React.JSX.Element {
  const { getTopProducts } = useReports();
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTopProducts = useCallback(
    async (selectedPeriod: ReportPeriod): Promise<void> => {
      setIsLoading(true);
      setError('');
      try {
        const { start, end } = getPeriodRange(selectedPeriod);
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
      void loadTopProducts(period);
    }, [loadTopProducts, period]),
  );

  return (
    <SafeAreaView style={[S.container, style]}>
      <AppHeader pageTitle="Top Selling" />
      <View style={S.filterBar}>
        {PERIODS.map((option) => {
          const isActive = period === option.key;
          return (
            <Pressable
              key={option.key}
              style={[S.filterTab, isActive ? S.filterTabActive : null]}
              onPress={() => setPeriod(option.key)}
            >
              <Text
                style={[
                  S.filterTabText,
                  isActive ? S.filterTabTextActive : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
          <Text style={S.emptyText}>No sales recorded for this period</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
