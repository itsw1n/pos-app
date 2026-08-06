import React, { useCallback } from 'react';
import { FlatList, StyleProp, Text, View, ViewStyle } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StockBadge } from '../../components/common/StockBadge/StockBadge';
import { colors } from '../../theme';
import { useInventory, InventoryItem, StockStatus } from './useInventory';
import { inventoryViewScreenStyles } from './InventoryViewScreen.styles';

interface InventoryViewScreenProps {
  style?: StyleProp<ViewStyle>;
}

const STATUS_LABEL: Record<StockStatus, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

export function InventoryViewScreen({ style }: InventoryViewScreenProps): React.JSX.Element {
  const { items, isLoading, error, loadInventory, getStatus, lowCount, criticalCount } =
    useInventory();

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory])
  );

  const alertCount = lowCount + criticalCount;

  const renderItem = ({ item }: { item: InventoryItem }): React.JSX.Element => {
    const status = getStatus(item);
    return (
      <View style={inventoryViewScreenStyles.itemCard}>
        <View style={inventoryViewScreenStyles.itemHeader}>
          <View style={inventoryViewScreenStyles.itemInfo}>
            <Text style={inventoryViewScreenStyles.itemName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={inventoryViewScreenStyles.itemCategory}>{item.product_category}</Text>
          </View>
          <StockBadge status={status} label={STATUS_LABEL[status]} />
        </View>
        <View style={inventoryViewScreenStyles.statsRow}>
          <Text style={inventoryViewScreenStyles.statLabel}>On hand</Text>
          <Text
            style={[
              inventoryViewScreenStyles.statValue,
              status === 'critical' ? inventoryViewScreenStyles.statValueCritical : null,
            ]}
          >
            {item.quantity}
          </Text>
          <Text style={inventoryViewScreenStyles.statDivider}>•</Text>
          <Text style={inventoryViewScreenStyles.statLabel}>Reorder at</Text>
          <Text style={inventoryViewScreenStyles.statValue}>{item.reorder_level}</Text>
        </View>
      </View>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={[inventoryViewScreenStyles.loadingContainer, style]}>
        <Text style={inventoryViewScreenStyles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={[inventoryViewScreenStyles.container, style]}>
      <View style={inventoryViewScreenStyles.summaryCard}>
        <View style={inventoryViewScreenStyles.summaryRow}>
          <Text style={inventoryViewScreenStyles.summaryLabel}>Total items</Text>
          <Text style={inventoryViewScreenStyles.summaryValue}>{items.length}</Text>
        </View>
        <View style={inventoryViewScreenStyles.summaryRow}>
          <Text style={inventoryViewScreenStyles.summaryLabel}>Low stock</Text>
          <Text style={inventoryViewScreenStyles.summaryValue}>{lowCount}</Text>
        </View>
        <View style={inventoryViewScreenStyles.summaryRow}>
          <Text style={inventoryViewScreenStyles.summaryLabel}>Out of stock</Text>
          <Text style={inventoryViewScreenStyles.summaryValueCritical}>{criticalCount}</Text>
        </View>
      </View>

      {alertCount > 0 ? (
        <View style={inventoryViewScreenStyles.alertBanner}>
          <View style={inventoryViewScreenStyles.bannerIcon}>
            <TriangleAlert size={18} color={colors.warning} />
          </View>
          <Text style={inventoryViewScreenStyles.alertText}>
            {criticalCount > 0 ? `${criticalCount} item(s) out of stock · ` : ''}
            {lowCount > 0 ? `${lowCount} item(s) low on stock` : ''}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={inventoryViewScreenStyles.errorText}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.stock_id)}
        renderItem={renderItem}
        contentContainerStyle={inventoryViewScreenStyles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
