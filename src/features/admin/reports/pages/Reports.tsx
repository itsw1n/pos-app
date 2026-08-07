import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { colors } from '@/theme';
import { ReportsStackParamList } from '@/features/admin/reports/ReportsNavigator';
import {
  useReports,
  ReportPeriod,
  SalesReport,
  InventoryReport,
  PaymentModeBreakdown,
  StockLevel,
} from '@/features/admin/reports/hooks/useReports';
import { reportsStyles } from './Reports.styles';

type ReportsProps = StackScreenProps<ReportsStackParamList, 'Reports'> & {
  style?: StyleProp<ViewStyle>;
};

const PERIODS: Array<{ key: ReportPeriod; label: string }> = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

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
          <View style={reportsStyles.stockBadge}>
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
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] =
    useState<InventoryReport | null>(null);
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
    [getSalesReport, getInventoryReport],
  );

  useFocusEffect(
    useCallback(() => {
      void loadReports(period);
    }, [loadReports, period]),
  );

  return (
    <SafeAreaView style={[reportsStyles.container, style]}>
      <AppHeader pageTitle="Reports" />
      <ScrollView
        style={reportsStyles.scrollContainer}
        contentContainerStyle={reportsStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={reportsStyles.filterBar}>
          {PERIODS.map((option) => {
            const isActive = period === option.key;
            return (
              <Pressable
                key={option.key}
                style={[
                  reportsStyles.filterTab,
                  isActive ? reportsStyles.filterTabActive : null,
                ]}
                onPress={() => setPeriod(option.key)}
              >
                <Text
                  style={[
                    reportsStyles.filterTabText,
                    isActive ? reportsStyles.filterTabTextActive : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
