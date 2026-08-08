import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const imagePickerFieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewTile: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  previewActions: {
    flex: 1,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  actionText: {
    ...typography.sm,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  actionTextDanger: {
    color: colors.danger,
  },
  addButton: {
    minHeight: 88,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.navActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    ...typography.md,
    color: colors.textSecondary,
    flexShrink: 1,
    textAlign: 'center',
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
