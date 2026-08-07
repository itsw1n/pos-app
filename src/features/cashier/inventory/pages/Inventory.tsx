import React, { useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '@/components/common/AppHeader/AppHeader';
import { StockBadge } from '@/components/common/StockBadge/StockBadge';
import { colors } from '@/theme';
import { useInventory, InventoryItem, StockStatus } from '@/hooks/useInventory';
import { inventoryStyles } from './Inventory.styles';

interface InventoryProps {
  style?: StyleProp<ViewStyle>;
}

const STATUS_LABEL: Record<StockStatus, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

export function Inventory({ style }: InventoryProps): React.JSX.Element {
  const {
    items,
    isLoading,
    error,
    loadInventory,
    getStatus,
    lowCount,
    criticalCount,
  } = useInventory();

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory]),
  );

  const alertCount = lowCount + criticalCount;

  const renderItem = ({ item }: { item: InventoryItem }): React.JSX.Element => {
    const status = getStatus(item);
    return (
      <View style={inventoryStyles.itemCard}>
        <View style={inventoryStyles.itemHeader}>
          <View style={inventoryStyles.itemInfo}>
            <Text style={inventoryStyles.itemName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={inventoryStyles.itemCategory}>
              {item.product_category}
            </Text>
          </View>
          <StockBadge status={status} label={STATUS_LABEL[status]} />
        </View>
        <View style={inventoryStyles.statsRow}>
          <Text style={inventoryStyles.statLabel}>On hand</Text>
          <Text
            style={[
              inventoryStyles.statValue,
              status === 'critical' ? inventoryStyles.statValueCritical : null,
            ]}
          >
            {item.quantity}
          </Text>
          <Text style={inventoryStyles.statDivider}>•</Text>
          <Text style={inventoryStyles.statLabel}>Reorder at</Text>
          <Text style={inventoryStyles.statValue}>{item.reorder_level}</Text>
        </View>
      </View>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={[inventoryStyles.loadingContainer, style]}>
        <Text style={inventoryStyles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[inventoryStyles.container, style]}>
      <AppHeader pageTitle="Inventory" />
      <View style={inventoryStyles.summaryCard}>
        <View style={inventoryStyles.summaryRow}>
          <Text style={inventoryStyles.summaryLabel}>Total items</Text>
          <Text style={inventoryStyles.summaryValue}>{items.length}</Text>
        </View>
        <View style={inventoryStyles.summaryRow}>
          <Text style={inventoryStyles.summaryLabel}>Low stock</Text>
          <Text style={inventoryStyles.summaryValue}>{lowCount}</Text>
        </View>
        <View style={inventoryStyles.summaryRow}>
          <Text style={inventoryStyles.summaryLabel}>Out of stock</Text>
          <Text style={inventoryStyles.summaryValueCritical}>
            {criticalCount}
          </Text>
        </View>
      </View>

      {alertCount > 0 ? (
        <View style={inventoryStyles.alertBanner}>
          <View style={inventoryStyles.bannerIcon}>
            <TriangleAlert size={18} color={colors.warning} />
          </View>
          <Text style={inventoryStyles.alertText}>
            {criticalCount > 0
              ? `${criticalCount} item(s) out of stock · `
              : ''}
            {lowCount > 0 ? `${lowCount} item(s) low on stock` : ''}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={inventoryStyles.errorText}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.stock_id)}
        renderItem={renderItem}
        contentContainerStyle={inventoryStyles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
