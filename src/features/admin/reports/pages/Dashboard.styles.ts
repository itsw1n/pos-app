import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.resting,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography['2xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.resting,
  },
  cardTitle: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  topSellingTitle: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.sm,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.resting,
  },
  lowStockTile: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowStockEmoji: {
    fontSize: 22,
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockName: {
    ...typography.md,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  lowStockMeta: {
    ...typography.sm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  topSellingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topProductColumn: {
    width: 100,
  },
  topProductTile: {
    width: 100,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  topProductEmoji: {
    fontSize: 32,
  },
  topProductName: {
    ...typography.sm,
    color: colors.textPrimary,
  },
  topProductSold: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  reportsButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  reportsButtonPressed: {
    backgroundColor: colors.iconCircle,
  },
  reportsButtonText: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});