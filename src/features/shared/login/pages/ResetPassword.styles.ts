import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const resetPasswordStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  backRow: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
  },
  backText: {
    ...typography.sm,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  title: {
    ...typography['3xl'],
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.md,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing['3xl'],
  },
  form: {
    gap: spacing.lg,
  },
  inputField: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.xl,
  },
  error: {
    ...typography.sm,
    color: colors.danger,
    textAlign: 'center',
  },
});
