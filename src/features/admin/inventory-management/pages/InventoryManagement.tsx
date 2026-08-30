import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as FileSystem from 'expo-file-system';
import { SearchBar } from '@/components/common/SearchBar/SearchBar';
import { StockBadge } from '@/components/common/StockBadge/StockBadge';
import { Button } from '@/components/common/Button/Button';
import { colors } from '@/theme';
import { ReportsStackParamList } from '@/features/admin/reports/ReportsNavigator';
import { useInventory, InventoryItem, StockStatus } from '@/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';
import {
  exportInventory,
  InventoryExportRow,
  shareExportedFile,
} from '@/services/exportService';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const { role } = useAuth();

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const statusFiltered =
      filter === 'all'
        ? items
        : items.filter((item) => getStatus(item) === filter);
    if (!query) return statusFiltered;
    return statusFiltered.filter(
      (item) =>
        item.product_name.toLowerCase().includes(query) ||
        item.product_category.toLowerCase().includes(query),
    );
  }, [items, filter, searchQuery, getStatus]);

  const onExport = useCallback(async (): Promise<void> => {
    if (role !== 'admin') return;
    if (filteredItems.length === 0) return;
    setExporting(true);
    try {
      const exportRows: InventoryExportRow[] = filteredItems.map((r) => ({
        product_id: r.product_id,
        name: r.product_name,
        category: r.product_category,
        price: r.price,
        quantity: r.quantity,
        reorder_level: r.reorder_level,
        status: getStatus(r),
        stock_value: r.price * r.quantity,
        supplier: null,
      }));
      const uri = await exportInventory(exportRows);
      await shareExportedFile(uri);
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // best-effort cleanup after share
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[Export] inventory failed', e);
      }
      Alert.alert(
        'Export failed',
        e instanceof Error ? e.message : 'Unknown error',
      );
    } finally {
      setExporting(false);
    }
  }, [role, filteredItems, getStatus]);

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory]),
  );

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

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name or category"
        style={inventoryManagementStyles.searchBar}
      />

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

      <View style={inventoryManagementStyles.exportRow}>
        <Button
          variant="secondary"
          size="small"
          disabled={filteredItems.length === 0 || exporting}
          onPress={() => {
            void onExport();
          }}
        >
          {exporting ? 'Exporting...' : 'Export inventory'}
        </Button>
        {exporting ? (
          <ActivityIndicator color={colors.primary} style={{ marginLeft: 8 }} />
        ) : null}
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
