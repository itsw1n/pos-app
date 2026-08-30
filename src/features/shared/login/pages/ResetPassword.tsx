import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { InputField } from '@/components/common/InputField/InputField';
import { Button } from '@/components/common/Button/Button';
import { confirmPasswordReset } from '@/api/authApi';
import { colors, radius } from '@/theme';
import { resetPasswordStyles as styles } from './ResetPassword.styles';
import type { LoginStackParamList } from '../LoginNavigator';

type ResetPasswordProps = StackScreenProps<
  LoginStackParamList,
  'ResetPassword'
>;

export function ResetPassword({
  navigation,
}: ResetPasswordProps): React.JSX.Element {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onReset = async (): Promise<void> => {
    if (loading) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(password);
      navigation.replace('Login');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Link expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.backRow}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹ Back to login</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>Enter your new password below.</Text>

          <View style={styles.form}>
            <InputField
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
              rightIcon={
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              }
              style={{
                borderRadius: radius.xl,
                height: 52,
                paddingHorizontal: 14,
              }}
            />

            <InputField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
              rightIcon={
                <Pressable onPress={() => setShowConfirm((prev) => !prev)}>
                  {showConfirm ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              }
              style={{
                borderRadius: radius.xl,
                height: 52,
                paddingHorizontal: 14,
              }}
              onSubmitEditing={() => {
                void onReset();
              }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button onPress={onReset} disabled={loading} size="large">
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
