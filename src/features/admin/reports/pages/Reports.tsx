import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { DateFilterPicker } from '@/components/common/DateFilter/DateFilterPicker';
import { DateFilter } from '@/components/common/DateFilter/types';
import { colors } from '@/theme';
import { ReportsStackParamList } from '@/features/admin/reports/ReportsNavigator';
import {
  useReports,
  SalesReport,
  InventoryReport,
  PaymentModeBreakdown,
  StockLevel,
} from '@/features/admin/reports/hooks/useReports';
import { reportsStyles } from './Reports.styles';

type ReportsProps = StackScreenProps<ReportsStackParamList, 'Reports'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_MODE_LABEL: Record<PaymentModeBreakdown['payment_mode'], string> =
  {
    cash: 'Cash',
    gcash: 'GCash',
    maya: 'Maya',
  };

const STOCK_LABEL: Record<StockLevel, string> = {
  ok: 'In Stock',
  low: 'Low',
  critical: 'Out',
};

function formatPeso(value: number): string {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

function filterToRange(filter: DateFilter): { start: Date; end: Date } {
  if (filter.type === 'all') {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return { start, end };
  }
  if (filter.type === 'single') {
    return { start: startOfDay(filter.date), end: endOfDay(filter.date) };
  }
  return { start: startOfDay(filter.from), end: endOfDay(filter.to) };
}

function SalesSummary({ report }: { report: SalesReport }): React.JSX.Element {
  return (
    <View style={reportsStyles.card}>
      <Text style={reportsStyles.cardTitle}>Sales Report</Text>
      <View style={reportsStyles.rangeRow}>
        <Text style={reportsStyles.rangeText}>
          {report.startDate} — {report.endDate}
        </Text>
      </View>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Revenue</Text>
        <Text style={reportsStyles.summaryValue}>
          {formatPeso(report.totalRevenue)}
        </Text>
      </View>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Orders</Text>
        <Text style={reportsStyles.summaryValue}>{report.totalOrders}</Text>
      </View>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Average order</Text>
        <Text style={reportsStyles.summaryValue}>
          {formatPeso(report.averageOrderValue)}
        </Text>
      </View>

      <View style={reportsStyles.divider} />

      <Text style={reportsStyles.sectionLabel}>By payment mode</Text>
      {report.paymentModeBreakdown.map((entry) => (
        <View key={entry.payment_mode} style={reportsStyles.listRow}>
          <Text style={reportsStyles.rowName}>
            {PAYMENT_MODE_LABEL[entry.payment_mode]}
          </Text>
          <Text style={reportsStyles.rowMeta}>{entry.orders} order(s)</Text>
          <Text style={reportsStyles.rowValue}>
            {formatPeso(entry.revenue)}
          </Text>
        </View>
      ))}

      <View style={reportsStyles.divider} />

      <Text style={reportsStyles.sectionLabel}>Per day</Text>
      {report.dailyBreakdown.map((day) => (
        <View key={day.date} style={reportsStyles.listRow}>
          <Text style={reportsStyles.rowName}>
            {day.label} <Text style={reportsStyles.rowMeta}>{day.date}</Text>
          </Text>
          <Text style={reportsStyles.rowMeta}>{day.orders} order(s)</Text>
          <Text style={reportsStyles.rowValue}>{formatPeso(day.revenue)}</Text>
        </View>
      ))}
    </View>
  );
}

function InventorySummary({
  report,
}: {
  report: InventoryReport;
}): React.JSX.Element {
  return (
    <View style={reportsStyles.card}>
      <Text style={reportsStyles.cardTitle}>Inventory Report</Text>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Items</Text>
        <Text style={reportsStyles.summaryValue}>{report.totalItems}</Text>
      </View>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Low stock</Text>
        <Text style={reportsStyles.summaryValue}>{report.lowStockCount}</Text>
      </View>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Out of stock</Text>
        <Text style={reportsStyles.summaryValueCritical}>
          {report.outOfStockCount}
        </Text>
      </View>
      <View style={reportsStyles.summaryRow}>
        <Text style={reportsStyles.summaryLabel}>Stock value</Text>
        <Text style={reportsStyles.summaryValue}>
          {formatPeso(report.stockValue)}
        </Text>
      </View>

      <View style={reportsStyles.divider} />

      <Text style={reportsStyles.sectionLabel}>Items</Text>
      {report.items.map((item) => (
        <View key={item.stock_id} style={reportsStyles.listRow}>
          <View style={reportsStyles.itemInfo}>
            <Text style={reportsStyles.rowName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={reportsStyles.rowMeta}>
              {item.quantity} on hand · reorder at {item.reorder_level}
            </Text>
          </View>
          <View
            style={[
              reportsStyles.stockBadge,
              item.status === 'critical'
                ? reportsStyles.stockBadgeCritical
                : null,
              item.status === 'low' ? reportsStyles.stockBadgeLow : null,
            ]}
          >
            <Text style={reportsStyles.stockBadgeText}>
              {STOCK_LABEL[item.status]}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function Reports({ style }: ReportsProps): React.JSX.Element {
  const { getSalesReport, getInventoryReport } = useReports();
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: 'single',
    date: new Date(),
  });
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] =
    useState<InventoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = useCallback(
    async (filter: DateFilter): Promise<void> => {
      setIsLoading(true);
      setError('');
      try {
        const { start, end } = filterToRange(filter);
        const [sales, inventory] = await Promise.all([
          getSalesReport(start, end),
          getInventoryReport(),
        ]);
        setSalesReport(sales);
        setInventoryReport(inventory);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    },
    [getSalesReport, getInventoryReport],
  );

  useFocusEffect(
    useCallback(() => {
      void loadReports(dateFilter);
    }, [loadReports, dateFilter]),
  );

  return (
    <SafeAreaView style={[reportsStyles.container, style]}>
      <ScrollView
        style={reportsStyles.scrollContainer}
        contentContainerStyle={reportsStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <DateFilterPicker
          value={dateFilter}
          onChange={setDateFilter}
          allowAll={false}
          style={reportsStyles.dateFilter}
        />

        {error ? <Text style={reportsStyles.errorText}>{error}</Text> : null}

        {isLoading && !salesReport && !inventoryReport ? (
          <View style={reportsStyles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={reportsStyles.loadingText}>Loading reports...</Text>
          </View>
        ) : (
          <>
            {salesReport ? <SalesSummary report={salesReport} /> : null}
            {inventoryReport ? (
              <InventorySummary report={inventoryReport} />
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
