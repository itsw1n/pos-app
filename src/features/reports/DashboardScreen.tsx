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
import { DollarSign, Receipt } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { AppHeader } from '../../components/common/AppHeader/AppHeader';
import { colors, radius, spacing } from '../../theme';
import { ReportsStackParamList } from './ReportsNavigator';
import { useReports, LowStockItem, TopProduct, DaySales } from './useReports';
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

const CHART_HEIGHT = 160;

function WeeklySalesChart({ data, width }: { data: DaySales[]; width: number }): React.JSX.Element {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const slotWidth = width / Math.max(data.length, 1);
  const barWidth = Math.min(slotWidth * 0.55, 22);
  const plotTop = spacing.lg;
  const plotHeight = CHART_HEIGHT - plotTop - spacing['2xl'];

  const bars = data.map((d, index) => {
    const barHeight = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * plotHeight, 2) : 0;
    const x = index * slotWidth + (slotWidth - barWidth) / 2;
    const y = plotTop + plotHeight - barHeight;
    return { ...d, x, y, barHeight };
  });

  return (
    <Svg width={width} height={CHART_HEIGHT} viewBox={`0 0 ${width} ${CHART_HEIGHT}`}>
      <Line
        x1={0}
        y1={plotTop + plotHeight}
        x2={width}
        y2={plotTop + plotHeight}
        stroke={colors.border}
        strokeWidth={1}
      />
      {bars.map((bar) => (
        <Rect
          key={bar.date}
          x={bar.x}
          y={bar.y}
          width={barWidth}
          height={bar.barHeight}
          rx={radius.sm}
          fill={colors.primary}
        />
      ))}
      {bars.map((bar) => (
        <SvgText
          key={`${bar.date}-label`}
          x={bar.x + barWidth / 2}
          y={CHART_HEIGHT - spacing.sm}
          fontSize={10}
          fill={colors.textSecondary}
          textAnchor="middle"
        >
          {bar.label}
        </SvgText>
      ))}
    </Svg>
  );
}

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
  const { dashboard, isLoading, error, loadDashboard } = useReports();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - spacing['2xl'] * 2 - spacing.lg * 2, 200);

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
      <AppHeader pageTitle="Dashboard Overview" />

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
          <WeeklySalesChart data={weeklyBreakdown} width={chartWidth} />
        </View>

        <View style={dashboardScreenStyles.section}>
          <View style={dashboardScreenStyles.sectionHeader}>
            <Text style={dashboardScreenStyles.sectionTitle}>Low Stock</Text>
            <Pressable onPress={() => navigation.navigate('Inventory')}>
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