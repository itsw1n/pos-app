import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { StockBadge } from '@/components/common/StockBadge/StockBadge';
import { colors } from '@/theme';
import { ReportsStackParamList } from '@/features/admin/reports/ReportsNavigator';
import { useInventory, InventoryItem, StockStatus } from '@/hooks/useInventory';
import { inventoryManagementStyles } from './InventoryManagement.styles';

type InventoryManagementProps = StackScreenProps<
  ReportsStackParamList,
  'Inventory'
> & {
  style?: StyleProp<ViewStyle>;
};

type FilterKey = 'all' | 'low' | 'critical';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low Stock' },
  { key: 'critical', label: 'Critical' },
];

const STATUS_LABEL: Record<StockStatus, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

export function InventoryManagement({
  navigation,
  style,
}: InventoryManagementProps): React.JSX.Element {
  const {
    items,
    isLoading,
    error,
    loadInventory,
    getStatus,
    lowCount,
    criticalCount,
  } = useInventory();
  const [filter, setFilter] = useState<FilterKey>('all');

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory]),
  );

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => getStatus(item) === filter);
  }, [items, filter, getStatus]);

  const alertCount = lowCount + criticalCount;

  const renderItem = ({ item }: { item: InventoryItem }): React.JSX.Element => {
    const status = getStatus(item);
    return (
      <View style={inventoryManagementStyles.itemCard}>
        <View style={inventoryManagementStyles.itemHeader}>
          <View style={inventoryManagementStyles.itemInfo}>
            <Text style={inventoryManagementStyles.itemName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={inventoryManagementStyles.itemCategory}>
              {item.product_category}
            </Text>
          </View>
          <StockBadge status={status} label={STATUS_LABEL[status]} />
        </View>
        <View style={inventoryManagementStyles.statsRow}>
          <Text style={inventoryManagementStyles.statLabel}>On hand</Text>
          <Text
            style={[
              inventoryManagementStyles.statValue,
              status === 'critical'
                ? inventoryManagementStyles.statValueCritical
                : null,
            ]}
          >
            {item.quantity}
          </Text>
          <Text style={inventoryManagementStyles.statDivider}>•</Text>
          <Text style={inventoryManagementStyles.statLabel}>Reorder at</Text>
          <Text style={inventoryManagementStyles.statValue}>
            {item.reorder_level}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            inventoryManagementStyles.stockInButton,
            pressed ? inventoryManagementStyles.stockInButtonPressed : null,
          ]}
          onPress={() =>
            navigation.navigate('StockIn', {
              stockId: item.stock_id,
              productName: item.product_name,
              currentQuantity: item.quantity,
              reorderLevel: item.reorder_level,
            })
          }
        >
          <Text style={inventoryManagementStyles.stockInButtonText}>
            Stock In
          </Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={[inventoryManagementStyles.loadingContainer, style]}>
        <Text style={inventoryManagementStyles.loadingText}>
          Loading inventory...
        </Text>
      </View>
    );
  }

  return (
    <View style={[inventoryManagementStyles.container, style]}>
      <View style={inventoryManagementStyles.summaryCard}>
        <View style={inventoryManagementStyles.summaryRow}>
          <Text style={inventoryManagementStyles.summaryLabel}>
            Total items
          </Text>
          <Text style={inventoryManagementStyles.summaryValue}>
            {items.length}
          </Text>
        </View>
        <View style={inventoryManagementStyles.summaryRow}>
          <Text style={inventoryManagementStyles.summaryLabel}>Low stock</Text>
          <Text style={inventoryManagementStyles.summaryValue}>{lowCount}</Text>
        </View>
        <View style={inventoryManagementStyles.summaryRow}>
          <Text style={inventoryManagementStyles.summaryLabel}>
            Out of stock
          </Text>
          <Text style={inventoryManagementStyles.summaryValueCritical}>
            {criticalCount}
          </Text>
        </View>
      </View>

      {alertCount > 0 ? (
        <View style={inventoryManagementStyles.alertBanner}>
          <View style={inventoryManagementStyles.bannerIcon}>
            <TriangleAlert size={18} color={colors.warning} />
          </View>
          <Text style={inventoryManagementStyles.alertText}>
            {criticalCount > 0
              ? `${criticalCount} item(s) out of stock · `
              : ''}
            {lowCount > 0 ? `${lowCount} item(s) low on stock` : ''}
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text style={inventoryManagementStyles.errorText}>{error}</Text>
      ) : null}

      <View style={inventoryManagementStyles.filterBar}>
        {FILTERS.map((option) => {
          const isActive = filter === option.key;
          return (
            <Pressable
              key={option.key}
              style={[
                inventoryManagementStyles.filterTab,
                isActive ? inventoryManagementStyles.filterTabActive : null,
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Text
                style={[
                  inventoryManagementStyles.filterTabText,
                  isActive
                    ? inventoryManagementStyles.filterTabTextActive
                    : null,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.stock_id)}
        renderItem={renderItem}
        contentContainerStyle={inventoryManagementStyles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
