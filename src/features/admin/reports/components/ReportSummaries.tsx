import React from 'react';
import { Text, View } from 'react-native';
import {
  InventoryReport,
  PaymentModeBreakdown,
  SalesReport,
  StockLevel,
} from '../hooks/useReports';
import { reportSummariesStyles as styles } from './ReportSummaries.styles';

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

export function SalesSummary({
  report,
}: {
  report: SalesReport;
}): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Sales Report</Text>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>
          {report.startDate} — {report.endDate}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Revenue</Text>
        <Text style={styles.summaryValue}>
          {formatPeso(report.totalRevenue)}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Orders</Text>
        <Text style={styles.summaryValue}>{report.totalOrders}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Average order</Text>
        <Text style={styles.summaryValue}>
          {formatPeso(report.averageOrderValue)}
        </Text>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>By payment mode</Text>
      {report.paymentModeBreakdown.map((entry) => (
        <View key={entry.payment_mode} style={styles.listRow}>
          <Text style={styles.rowName}>
            {PAYMENT_MODE_LABEL[entry.payment_mode]}
          </Text>
          <Text style={styles.rowMeta}>{entry.orders} order(s)</Text>
          <Text style={styles.rowValue}>{formatPeso(entry.revenue)}</Text>
        </View>
      ))}

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Per day</Text>
      {report.dailyBreakdown.map((day) => (
        <View key={day.date} style={styles.listRow}>
          <Text style={styles.rowName}>
            {day.label} <Text style={styles.rowMeta}>{day.date}</Text>
          </Text>
          <Text style={styles.rowMeta}>{day.orders} order(s)</Text>
          <Text style={styles.rowValue}>{formatPeso(day.revenue)}</Text>
        </View>
      ))}
    </View>
  );
}

export function InventorySummary({
  report,
}: {
  report: InventoryReport;
}): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Inventory Report</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Items</Text>
        <Text style={styles.summaryValue}>{report.totalItems}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Low stock</Text>
        <Text style={styles.summaryValue}>{report.lowStockCount}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Out of stock</Text>
        <Text style={styles.summaryValueCritical}>
          {report.outOfStockCount}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Stock value</Text>
        <Text style={styles.summaryValue}>{formatPeso(report.stockValue)}</Text>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Items</Text>
      {report.items.map((item) => (
        <View key={item.stock_id} style={styles.listRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.rowName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={styles.rowMeta}>
              {item.quantity} on hand · reorder at {item.reorder_level}
            </Text>
          </View>
          <View
            style={[
              styles.stockBadge,
              item.status === 'critical' ? styles.stockBadgeCritical : null,
              item.status === 'low' ? styles.stockBadgeLow : null,
            ]}
          >
            <Text style={styles.stockBadgeText}>
              {STOCK_LABEL[item.status]}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
