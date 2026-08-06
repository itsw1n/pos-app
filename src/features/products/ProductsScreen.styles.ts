import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const productsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    marginHorizontal: spacing['2xl'],
    marginVertical: spacing.md,
  },
  categoryWrapper: {
    marginBottom: spacing.md,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['7xl'],
  },
  sectionHeader: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.resting,
  },
  emojiTile: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emojiText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    ...typography.md,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing['2xl'],
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.modal,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  fabMenuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
    ...shadows.modal,
  },
  fabMenuTitle: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fabMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  fabMenuOptionPressed: {
    backgroundColor: colors.background,
  },
  fabMenuOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.navActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  fabMenuOptionTextBlock: {
    flex: 1,
  },
  fabMenuOptionTitle: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  fabMenuOptionCaption: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fabMenuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});