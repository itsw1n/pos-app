import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system/legacy';
import NetInfo from '@react-native-community/netinfo';
import { DateFilterPicker } from '@/components/common/DateFilter/DateFilterPicker';
import { DateFilter } from '@/components/common/DateFilter/types';
import { Button } from '@/components/common/Button/Button';
import { colors } from '@/theme';
import { ReportsStackParamList } from '@/features/admin/reports/ReportsNavigator';
import {
  useReports,
  SalesReport,
  InventoryReport,
  PaymentModeBreakdown,
  StockLevel,
} from '@/features/admin/reports/hooks/useReports';
import { useAuth } from '@/context/AuthContext';
import {
  exportTransactions,
  TransactionExportRow,
  shareExportedFile,
} from '@/services/exportService';
import {
  getTransactionsInRange,
  getTransactionItems,
  getTransactionItemsByTransactionIds,
} from '@/api/transactionApi';
import { getUsersIdName } from '@/api/userApi';
import { getProducts } from '@/api/productApi';
import {
  getLocalProducts,
  getLocalTransactionItems,
  getLocalTransactions,
  getLocalUsers,
} from '@/services/sqlite';
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
  const [exporting, setExporting] = useState(false);
  const { role } = useAuth();

  function getRangeLabel(filter: DateFilter): string {
    if (filter.type === 'all') return 'all';
    if (filter.type === 'single') return filter.date.toISOString().slice(0, 10);
    return `${filter.from.toISOString().slice(0, 10)}_to_${filter.to.toISOString().slice(0, 10)}`;
  }

  const onExport = useCallback(async (): Promise<void> => {
    if (role !== 'admin') return;
    setExporting(true);
    try {
      const { start, end } = filterToRange(dateFilter);
      const rangeLabel = getRangeLabel(dateFilter);

      let isConnected = true;
      try {
        const state = await NetInfo.fetch();
        isConnected = state.isConnected === true;
      } catch {
        isConnected = false;
      }

      const buildSummary = (
        items: { product_id: number; quantity: number }[],
        productMap: Map<number, string>,
      ): string =>
        items
          .map(
            (it) =>
              `${it.quantity}x ${productMap.get(it.product_id) ?? `Product #${it.product_id}`}`,
          )
          .join(', ');

      let rows: TransactionExportRow[] = [];
      let onlineSucceeded = false;

      if (isConnected) {
        try {
          const transactions = await getTransactionsInRange(start, end);
          let users: { user_id: string; username: string }[] = [];
          try {
            users = await getUsersIdName();
          } catch {
            // best-effort cashier lookup — fallback to user_id
          }
          const userMap = new Map(users.map((u) => [u.user_id, u.username]));

          let products: { product_id: number; name: string }[] = [];
          try {
            const fetched = await getProducts();
            products = fetched.map((p) => ({
              product_id: p.product_id,
              name: p.name,
            }));
          } catch {
            // fallback to local products if Supabase unavailable
            try {
              const local = await getLocalProducts();
              products = local.map((p) => ({
                product_id: p.product_id,
                name: p.name,
              }));
            } catch {
              // no products — summary will use fallback names
            }
          }
          const productMap = new Map(
            products.map((p) => [p.product_id, p.name]),
          );

          const ids = transactions.map((t) => t.id);
          const itemsByTx = new Map<
            string,
            { product_id: number; quantity: number }[]
          >();
          if (ids.length > 0) {
            try {
              const bulk = await getTransactionItemsByTransactionIds(ids);
              for (const it of bulk) {
                const list = itemsByTx.get(it.transaction_id) ?? [];
                list.push({
                  product_id: it.product_id,
                  quantity: it.quantity,
                });
                itemsByTx.set(it.transaction_id, list);
              }
            } catch {
              const results = await Promise.all(
                ids.map((id) =>
                  getTransactionItems(id).catch(() => [] as never[]),
                ),
              );
              ids.forEach((id, idx) => {
                const list = (
                  results[idx] as unknown as {
                    product_id: number;
                    quantity: number;
                  }[]
                ).map((r) => ({
                  product_id: r.product_id,
                  quantity: r.quantity,
                }));
                itemsByTx.set(id, list);
              });
            }
          }

          rows = transactions.map((t) => ({
            order_number: t.order_number ?? null,
            transaction_id: t.id,
            date: t.date,
            items_summary: buildSummary(itemsByTx.get(t.id) ?? [], productMap),
            payment_mode: t.payment_mode,
            total_amount: t.total_amount,
            status: t.status ?? 'completed',
            cashier: userMap.get(t.user_id) ?? t.user_id,
          }));
          onlineSucceeded = true;
        } catch {
          isConnected = false;
        }
      }

      if (!isConnected || !onlineSucceeded) {
        const localTx = await getLocalTransactions();
        const filtered = localTx.filter((tx) => {
          const t = new Date(tx.date).getTime();
          return t >= start.getTime() && t <= end.getTime();
        });
        const [localUsers, localProducts] = await Promise.all([
          getLocalUsers().catch(() => []),
          getLocalProducts().catch(() => []),
        ]);
        const userMap = new Map(localUsers.map((u) => [u.user_id, u.username]));
        const productMap = new Map(
          localProducts.map((p) => [p.product_id, p.name]),
        );
        const offlineRows: TransactionExportRow[] = [];
        for (const tx of filtered) {
          let items: { product_id: number; quantity: number }[] = [];
          try {
            items = await getLocalTransactionItems(tx.id);
          } catch {
            // no items — leave summary empty
          }
          offlineRows.push({
            order_number: tx.order_number ?? null,
            transaction_id: tx.id,
            date: tx.date,
            items_summary: buildSummary(items, productMap),
            payment_mode: tx.payment_mode,
            total_amount: tx.total_amount,
            status: tx.status ?? 'completed',
            cashier: userMap.get(tx.user_id) ?? tx.user_id,
          });
        }
        // Only replace rows when online did not succeed, or when offline has data and online failed
        if (!onlineSucceeded) {
          rows = offlineRows;
        }
      }

      const uri = await exportTransactions(rows, rangeLabel);
      await shareExportedFile(uri);
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // best-effort cleanup after share
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[Export] transactions failed', e);
      }
      Alert.alert(
        'Export failed',
        e instanceof Error ? e.message : 'Unknown error',
      );
    } finally {
      setExporting(false);
    }
  }, [role, dateFilter]);

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

        <View style={reportsStyles.exportRow}>
          <Button
            variant="secondary"
            size="small"
            disabled={exporting || (isLoading && !salesReport)}
            onPress={() => {
              void onExport();
            }}
          >
            {exporting ? 'Exporting...' : 'Export transactions'}
          </Button>
          {exporting ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginLeft: 8 }}
            />
          ) : null}
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
