import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, Text, View, ViewStyle, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartesianChart, Bar } from 'victory-native';
import { colors, radius, spacing } from '../../theme';
import { ReportsStackParamList } from './ReportsNavigator';
import { useReports, LowStockItem, TopProduct } from './useReports';
import { dashboardScreenStyles } from './DashboardScreen.styles';

type DashboardScreenProps = StackScreenProps<ReportsStackParamList, 'Dashboard'> & {
  style?: StyleProp<ViewStyle>;
};

const PAYMENT_CURRENCY = '₱';

function formatPeso(value: number): string {
  return `${PAYMENT_CURRENCY}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAxisLabel(value: number): string {
  if (value >= 1000) {
    return `${PAYMENT_CURRENCY}${(value / 1000).toFixed(1)}k`;
  }
  return `${PAYMENT_CURRENCY}${Math.round(value)}`;
}

function LowStockRow({ item }: { item: LowStockItem }): React.JSX.Element {
  const isCritical = item.quantity <= 0;
  return (
    <View style={dashboardScreenStyles.lowStockRow}>
      <View style={dashboardScreenStyles.lowStockInfo}>
        <Text style={dashboardScreenStyles.rowName} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Text style={dashboardScreenStyles.rowMeta}>
          Reorder at {item.reorder_level}
        </Text>
      </View>
      <Text
        style={[
          dashboardScreenStyles.rowValue,
          isCritical ? dashboardScreenStyles.rowValueCritical : dashboardScreenStyles.rowValueLow,
        ]}
      >
        {item.quantity}
      </Text>
    </View>
  );
}

function TopProductRow({ product }: { product: TopProduct }): React.JSX.Element {
  return (
    <View style={dashboardScreenStyles.topProductRow}>
      <View style={dashboardScreenStyles.topProductInfo}>
        <Text style={dashboardScreenStyles.rowName} numberOfLines={1}>
          {product.product_name}
        </Text>
        <Text style={dashboardScreenStyles.rowMeta}>
          {product.quantity_sold} sold
        </Text>
      </View>
      <Text style={dashboardScreenStyles.rowValue}>{formatPeso(product.revenue)}</Text>
    </View>
  );
}

export function DashboardScreen({ navigation, style }: DashboardScreenProps): React.JSX.Element {
  const { dashboard, isLoading, error, loadDashboard } = useReports();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - spacing.lg * 4, 200);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  if (isLoading && !dashboard) {
    return (
      <View style={[dashboardScreenStyles.loadingContainer, style]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={dashboardScreenStyles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const weeklyBreakdown = dashboard?.weeklyBreakdown ?? [];
  const lowStock = dashboard?.lowStock ?? [];
  const topProducts = dashboard?.topProducts ?? [];

  return (
    <ScrollView
      style={[dashboardScreenStyles.container, style]}
      contentContainerStyle={dashboardScreenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={dashboardScreenStyles.summaryRow}>
        <View style={dashboardScreenStyles.summaryCard}>
          <Text style={dashboardScreenStyles.summaryLabel}>Revenue</Text>
          <Text style={dashboardScreenStyles.summaryValue}>{formatPeso(dashboard?.totalRevenue ?? 0)}</Text>
        </View>
        <View style={dashboardScreenStyles.summaryCard}>
          <Text style={dashboardScreenStyles.summaryLabel}>Orders</Text>
          <Text style={dashboardScreenStyles.summaryValue}>{dashboard?.totalOrders ?? 0}</Text>
        </View>
      </View>

      {error ? <Text style={dashboardScreenStyles.errorText}>{error}</Text> : null}

      <View style={dashboardScreenStyles.card}>
        <Text style={dashboardScreenStyles.cardTitle}>Weekly Revenue</Text>
        <View style={dashboardScreenStyles.chart}>
          <CartesianChart
            data={weeklyBreakdown}
            xKey="label"
            yKeys={['revenue']}
            orientation="vertical"
            explicitSize={{ width: chartWidth, height: 200 }}
            xAxis={{
              formatXLabel: (label) => String(label),
              labelColor: colors.textSecondary,
              lineColor: colors.border,
            }}
            yAxis={[
              {
                formatYLabel: (label) => formatAxisLabel(label),
                labelColor: colors.textSecondary,
                lineColor: colors.border,
              },
            ]}
          >
            {({ points, chartBounds }) => (
              <Bar
                points={points.revenue}
                chartBounds={chartBounds}
                color={colors.primary}
                roundedCorners={{ topLeft: radius.sm, topRight: radius.sm }}
              />
            )}
          </CartesianChart>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          dashboardScreenStyles.reportsButton,
          pressed ? dashboardScreenStyles.reportsButtonPressed : null,
        ]}
        onPress={() => navigation.navigate('Reports')}
      >
        <Text style={dashboardScreenStyles.reportsButtonText}>View Sales &amp; Inventory Reports</Text>
      </Pressable>

      <View style={dashboardScreenStyles.card}>
        <Text style={dashboardScreenStyles.cardTitle}>Low Stock</Text>
        {lowStock.length > 0 ? (
          lowStock.slice(0, 5).map((item) => <LowStockRow key={item.stock_id} item={item} />)
        ) : (
          <Text style={dashboardScreenStyles.emptyText}>All items are sufficiently stocked</Text>
        )}
      </View>

      <View style={dashboardScreenStyles.card}>
        <Text style={dashboardScreenStyles.cardTitle}>Top Products</Text>
        {topProducts.length > 0 ? (
          topProducts.map((product) => (
            <TopProductRow key={product.product_id} product={product} />
          ))
        ) : (
          <Text style={dashboardScreenStyles.emptyText}>No sales recorded yet</Text>
        )}
      </View>
    </ScrollView>
  );
}
