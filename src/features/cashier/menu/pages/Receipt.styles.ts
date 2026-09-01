import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const receiptStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  topBarBalance: {
    width: 22,
  },
  topBarTitle: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: 32,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.hover,
  },
  successTitle: {
    ...typography['2xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    ...typography.md,
    color: colors.textSecondary,
  },
  newTransactionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.active,
  },
  newTransactionButtonText: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
