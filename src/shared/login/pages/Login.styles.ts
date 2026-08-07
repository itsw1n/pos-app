import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  heroContainer: {
    width: '100%',
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    marginTop: spacing.sm,
    marginBottom: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholder: {
    fontSize: 64,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subheading: {
    ...typography.md,
    color: colors.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputGroupLarge: {
    marginBottom: spacing['2xl'],
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing['2xl'],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
    letterSpacing: 0.3,
  },
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  error: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});