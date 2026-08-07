import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { colors } from '../../theme';
import { ReportsStackParamList } from './ReportsNavigator';
import {
  useReports,
  ReportPeriod,
  SalesReport,
  InventoryReport,
  PaymentModeBreakdown,
  StockLevel,
} from './useReports';
import { reportsScreenStyles } from './ReportsScreen.styles';

type ReportsScreenProps = StackScreenProps<ReportsStackParamList, 'Reports'> & {
  style?: StyleProp<ViewStyle>;
};

const PERIODS: Array<{ key: ReportPeriod; label: string }> = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

const PAYMENT_MODE_LABEL: Record<PaymentModeBreakdown['payment_mode'], string> = {
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

function SalesSummary({
  report,
}: {
  report: SalesReport;
}): React.JSX.Element {
  return (
    <View style={reportsScreenStyles.card}>
      <Text style={reportsScreenStyles.cardTitle}>Sales Report</Text>
      <View style={reportsScreenStyles.rangeRow}>
        <Text style={reportsScreenStyles.rangeText}>
          {report.startDate} — {report.endDate}
        </Text>
      </View>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Revenue</Text>
        <Text style={reportsScreenStyles.summaryValue}>{formatPeso(report.totalRevenue)}</Text>
      </View>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Orders</Text>
        <Text style={reportsScreenStyles.summaryValue}>{report.totalOrders}</Text>
      </View>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Average order</Text>
        <Text style={reportsScreenStyles.summaryValue}>{formatPeso(report.averageOrderValue)}</Text>
      </View>

      <View style={reportsScreenStyles.divider} />

      <Text style={reportsScreenStyles.sectionLabel}>By payment mode</Text>
      {report.paymentModeBreakdown.map((entry) => (
        <View key={entry.payment_mode} style={reportsScreenStyles.listRow}>
          <Text style={reportsScreenStyles.rowName}>{PAYMENT_MODE_LABEL[entry.payment_mode]}</Text>
          <Text style={reportsScreenStyles.rowMeta}>{entry.orders} order(s)</Text>
          <Text style={reportsScreenStyles.rowValue}>{formatPeso(entry.revenue)}</Text>
        </View>
      ))}

      <View style={reportsScreenStyles.divider} />

      <Text style={reportsScreenStyles.sectionLabel}>Per day</Text>
      {report.dailyBreakdown.map((day) => (
        <View key={day.date} style={reportsScreenStyles.listRow}>
          <Text style={reportsScreenStyles.rowName}>
            {day.label} <Text style={reportsScreenStyles.rowMeta}>{day.date}</Text>
          </Text>
          <Text style={reportsScreenStyles.rowMeta}>{day.orders} order(s)</Text>
          <Text style={reportsScreenStyles.rowValue}>{formatPeso(day.revenue)}</Text>
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
    <View style={reportsScreenStyles.card}>
      <Text style={reportsScreenStyles.cardTitle}>Inventory Report</Text>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Items</Text>
        <Text style={reportsScreenStyles.summaryValue}>{report.totalItems}</Text>
      </View>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Low stock</Text>
        <Text style={reportsScreenStyles.summaryValue}>{report.lowStockCount}</Text>
      </View>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Out of stock</Text>
        <Text style={reportsScreenStyles.summaryValueCritical}>{report.outOfStockCount}</Text>
      </View>
      <View style={reportsScreenStyles.summaryRow}>
        <Text style={reportsScreenStyles.summaryLabel}>Stock value</Text>
        <Text style={reportsScreenStyles.summaryValue}>{formatPeso(report.stockValue)}</Text>
      </View>

      <View style={reportsScreenStyles.divider} />

      <Text style={reportsScreenStyles.sectionLabel}>Items</Text>
      {report.items.map((item) => (
        <View key={item.stock_id} style={reportsScreenStyles.listRow}>
          <View style={reportsScreenStyles.itemInfo}>
            <Text style={reportsScreenStyles.rowName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={reportsScreenStyles.rowMeta}>
              {item.quantity} on hand · reorder at {item.reorder_level}
            </Text>
          </View>
          <View style={reportsScreenStyles.stockBadge}>
            <Text style={reportsScreenStyles.stockBadgeText}>{STOCK_LABEL[item.status]}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function ReportsScreen({ style }: ReportsScreenProps): React.JSX.Element {
  const { getSalesReport, getInventoryReport } = useReports();
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = useCallback(
    async (selectedPeriod: ReportPeriod): Promise<void> => {
      setIsLoading(true);
      setError('');
      try {
        const [sales, inventory] = await Promise.all([
          getSalesReport(selectedPeriod),
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
    [getSalesReport, getInventoryReport]
  );

  useFocusEffect(
    useCallback(() => {
      void loadReports(period);
    }, [loadReports, period])
  );

  return (
    <ScrollView
      style={[reportsScreenStyles.container, style]}
      contentContainerStyle={reportsScreenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={reportsScreenStyles.filterBar}>
        {PERIODS.map((option) => {
          const isActive = period === option.key;
          return (
            <Pressable
              key={option.key}
              style={[
                reportsScreenStyles.filterTab,
                isActive ? reportsScreenStyles.filterTabActive : null,
              ]}
              onPress={() => setPeriod(option.key)}
            >
              <Text
                style={[
                  reportsScreenStyles.filterTabText,
                  isActive ? reportsScreenStyles.filterTabTextActive : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={reportsScreenStyles.errorText}>{error}</Text> : null}

      {isLoading && !salesReport && !inventoryReport ? (
        <View style={reportsScreenStyles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={reportsScreenStyles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <>
          {salesReport ? <SalesSummary report={salesReport} /> : null}
          {inventoryReport ? <InventorySummary report={inventoryReport} /> : null}
        </>
      )}
    </ScrollView>
  );
}
