import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { StockBadge } from '../../components/common/StockBadge/StockBadge';
import { colors } from '../../theme';
import { InventoryStackParamList } from './InventoryNavigator';
import { useInventory, InventoryItem, StockStatus } from './useInventory';
import { inventoryScreenStyles } from './InventoryScreen.styles';

type InventoryScreenProps = StackScreenProps<InventoryStackParamList, 'InventoryList'> & {
  style?: StyleProp<ViewStyle>;
};

type FilterKey = 'all' | 'low' | 'critical';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low Stock' },
  { key: 'critical', label: 'Critical' },
];

const STATUS_LABEL: Record<StockStatus, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

export function InventoryScreen({ navigation, style }: InventoryScreenProps): React.JSX.Element {
  const { items, isLoading, error, loadInventory, getStatus, lowCount, criticalCount } =
    useInventory();
  const [filter, setFilter] = useState<FilterKey>('all');

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory])
  );

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => getStatus(item) === filter);
  }, [items, filter, getStatus]);

  const alertCount = lowCount + criticalCount;

  const renderItem = ({ item }: { item: InventoryItem }): React.JSX.Element => {
    const status = getStatus(item);
    return (
      <View style={inventoryScreenStyles.itemCard}>
        <View style={inventoryScreenStyles.itemHeader}>
          <View style={inventoryScreenStyles.itemInfo}>
            <Text style={inventoryScreenStyles.itemName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={inventoryScreenStyles.itemCategory}>{item.product_category}</Text>
          </View>
          <StockBadge status={status} label={STATUS_LABEL[status]} />
        </View>
        <View style={inventoryScreenStyles.statsRow}>
          <Text style={inventoryScreenStyles.statLabel}>On hand</Text>
          <Text
            style={[
              inventoryScreenStyles.statValue,
              status === 'critical' ? inventoryScreenStyles.statValueCritical : null,
            ]}
          >
            {item.quantity}
          </Text>
          <Text style={inventoryScreenStyles.statDivider}>•</Text>
          <Text style={inventoryScreenStyles.statLabel}>Reorder at</Text>
          <Text style={inventoryScreenStyles.statValue}>{item.reorder_level}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            inventoryScreenStyles.stockInButton,
            pressed ? inventoryScreenStyles.stockInButtonPressed : null,
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
          <Text style={inventoryScreenStyles.stockInButtonText}>Stock In</Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={[inventoryScreenStyles.loadingContainer, style]}>
        <Text style={inventoryScreenStyles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={[inventoryScreenStyles.container, style]}>
      <View style={inventoryScreenStyles.summaryCard}>
        <View style={inventoryScreenStyles.summaryRow}>
          <Text style={inventoryScreenStyles.summaryLabel}>Total items</Text>
          <Text style={inventoryScreenStyles.summaryValue}>{items.length}</Text>
        </View>
        <View style={inventoryScreenStyles.summaryRow}>
          <Text style={inventoryScreenStyles.summaryLabel}>Low stock</Text>
          <Text style={inventoryScreenStyles.summaryValue}>{lowCount}</Text>
        </View>
        <View style={inventoryScreenStyles.summaryRow}>
          <Text style={inventoryScreenStyles.summaryLabel}>Out of stock</Text>
          <Text style={inventoryScreenStyles.summaryValueCritical}>{criticalCount}</Text>
        </View>
      </View>

      {alertCount > 0 ? (
        <View style={inventoryScreenStyles.alertBanner}>
          <View style={inventoryScreenStyles.bannerIcon}>
            <TriangleAlert size={18} color={colors.warning} />
          </View>
          <Text style={inventoryScreenStyles.alertText}>
            {criticalCount > 0 ? `${criticalCount} item(s) out of stock · ` : ''}
            {lowCount > 0 ? `${lowCount} item(s) low on stock` : ''}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={inventoryScreenStyles.errorText}>{error}</Text> : null}

      <View style={inventoryScreenStyles.filterBar}>
        {FILTERS.map((option) => {
          const isActive = filter === option.key;
          return (
            <Pressable
              key={option.key}
              style={[
                inventoryScreenStyles.filterTab,
                isActive ? inventoryScreenStyles.filterTabActive : null,
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Text
                style={[
                  inventoryScreenStyles.filterTabText,
                  isActive ? inventoryScreenStyles.filterTabTextActive : null,
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
        contentContainerStyle={inventoryScreenStyles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
