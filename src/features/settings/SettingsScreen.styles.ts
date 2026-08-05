import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const settingsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  sectionLabel: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionLabelFirst: {
    marginTop: 0,
  },
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryCardPressed: {
    ...shadows.active,
    backgroundColor: colors.navActive,
  },
  entryCardFirst: {
    marginTop: 0,
  },
  entryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  entryTitle: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  entryCaption: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  chevron: {
    ...typography.xl,
    color: colors.disabled,
  },
  adminBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  adminBadgeText: {
    ...typography.xs,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  footer: {
    ...typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
