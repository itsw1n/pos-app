import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { DollarSign, Receipt, Settings } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartesianChart, Bar } from 'victory-native';
import { useAuth } from '../../context/AuthContext';
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
  return (
    <View style={dashboardScreenStyles.lowStockRow}>
      <View style={dashboardScreenStyles.lowStockTile}>
        <Text style={dashboardScreenStyles.lowStockEmoji}>☕</Text>
      </View>
      <View style={dashboardScreenStyles.lowStockInfo}>
        <Text style={dashboardScreenStyles.lowStockName} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Text style={dashboardScreenStyles.lowStockMeta}>
          Only {item.quantity} units left
        </Text>
      </View>
    </View>
  );
}

const CHART_HEIGHT = 140;

function TopProductColumn({ product }: { product: TopProduct }): React.JSX.Element {
  return (
    <View style={dashboardScreenStyles.topProductColumn}>
      <View style={dashboardScreenStyles.topProductTile}>
        <Text style={dashboardScreenStyles.topProductEmoji}>☕</Text>
      </View>
      <Text style={dashboardScreenStyles.topProductName} numberOfLines={1}>
        {product.product_name}
      </Text>
      <Text style={dashboardScreenStyles.topProductSold}>
        {product.quantity_sold} Sold Today
      </Text>
    </View>
  );
}

export function DashboardScreen({ navigation, style }: DashboardScreenProps): React.JSX.Element {
  const { user } = useAuth();
  const { dashboard, isLoading, error, loadDashboard } = useReports();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - spacing['2xl'] * 2 - spacing.lg * 2, 200);

  const initials = (user?.username?.[0] ?? '').toUpperCase();

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
    <SafeAreaView style={[dashboardScreenStyles.container, style]}>
      <View style={dashboardScreenStyles.topBar}>
        <View style={dashboardScreenStyles.brandRow}>
          <View style={dashboardScreenStyles.avatar}>
            <Text style={dashboardScreenStyles.avatarText}>{initials || '?'}</Text>
          </View>
          <View style={dashboardScreenStyles.brandTextWrap}>
            <Text style={dashboardScreenStyles.brandName}>ElviraCafe POS</Text>
            <Text style={dashboardScreenStyles.brandSubtitle}>Dashboard Overview</Text>
          </View>
        </View>
        <Pressable onPress={() => navigation.getParent()?.navigate('Settings' as never)}>
          <Settings size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={[dashboardScreenStyles.scrollContainer, style]}
        contentContainerStyle={dashboardScreenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={dashboardScreenStyles.summaryRow}>
          <View style={dashboardScreenStyles.summaryCard}>
            <View style={dashboardScreenStyles.iconCircle}>
              <DollarSign size={18} color={colors.primary} />
            </View>
            <Text style={dashboardScreenStyles.summaryLabel}>Total Revenue</Text>
            <Text style={dashboardScreenStyles.summaryValue}>
              {formatPeso(dashboard?.totalRevenue ?? 0)}
            </Text>
          </View>
          <View style={dashboardScreenStyles.summaryCard}>
            <View style={dashboardScreenStyles.iconCircle}>
              <Receipt size={18} color={colors.primary} />
            </View>
            <Text style={dashboardScreenStyles.summaryLabel}>Total Orders</Text>
            <Text style={dashboardScreenStyles.summaryValue}>{dashboard?.totalOrders ?? 0}</Text>
          </View>
        </View>

        {error ? <Text style={dashboardScreenStyles.errorText}>{error}</Text> : null}

        <View style={dashboardScreenStyles.card}>
          <Text style={dashboardScreenStyles.cardTitle}>Weekly Sales</Text>
          <CartesianChart
            data={weeklyBreakdown}
            xKey="label"
            yKeys={['revenue']}
            orientation="vertical"
            explicitSize={{ width: chartWidth, height: CHART_HEIGHT }}
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

        <View style={dashboardScreenStyles.section}>
          <View style={dashboardScreenStyles.sectionHeader}>
            <Text style={dashboardScreenStyles.sectionTitle}>Low Stock</Text>
            <Pressable onPress={() => navigation.getParent()?.navigate('Inventory' as never)}>
              <Text style={dashboardScreenStyles.viewAll}>View All</Text>
            </Pressable>
          </View>
          {lowStock.length > 0 ? (
            lowStock.slice(0, 2).map((item) => <LowStockRow key={item.stock_id} item={item} />)
          ) : (
            <Text style={dashboardScreenStyles.emptyText}>All items are sufficiently stocked</Text>
          )}
        </View>

        <View style={dashboardScreenStyles.section}>
          <Text style={dashboardScreenStyles.topSellingTitle}>Top Selling</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dashboardScreenStyles.topSellingRow}
          >
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <TopProductColumn key={product.product_id} product={product} />
              ))
            ) : (
              <Text style={dashboardScreenStyles.emptyText}>No sales recorded yet</Text>
            )}
          </ScrollView>
        </View>

        <Pressable
          style={({ pressed }) => [
            dashboardScreenStyles.reportsButton,
            pressed ? dashboardScreenStyles.reportsButtonPressed : null,
          ]}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={dashboardScreenStyles.reportsButtonText}>
            View Sales &amp; Inventory Reports
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}