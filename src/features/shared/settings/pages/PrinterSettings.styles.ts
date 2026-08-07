import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const printerSettingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  cardTitle: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardCaption: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOptionLeft: {
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    marginRight: spacing.xs,
  },
  toggleOptionRight: {
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginLeft: spacing.xs,
  },
  toggleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  toggleOptionText: {
    ...typography.md,
    color: colors.textSecondary,
  },
  toggleOptionTextActive: {
    color: colors.surface,
    fontWeight: '600' as const,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  deviceName: {
    ...typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  deviceStatus: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  testButton: {
    marginBottom: spacing.md,
  },
  statusBanner: {
    backgroundColor: colors.warning,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statusBannerSuccess: {
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.md,
    color: colors.surface,
  },
});
