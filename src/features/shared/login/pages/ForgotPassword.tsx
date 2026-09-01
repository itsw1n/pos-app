import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Mail } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { InputField } from '@/components/common/InputField/InputField';
import { Button } from '@/components/common/Button/Button';
import { Screen } from '@/components/common/Screen/Screen';
import { OfflineBanner } from '@/components/common/OfflineBanner/OfflineBanner';
import { useConnectivity } from '@/hooks/useConnectivity';
import { requestPasswordReset } from '@/api/authApi';
import { colors } from '@/theme';
import { forgotPasswordStyles as styles } from './ForgotPassword.styles';
import type { LoginStackParamList } from '../LoginNavigator';

type ForgotPasswordProps = StackScreenProps<
  LoginStackParamList,
  'ForgotPassword'
>;

export function ForgotPassword({
  navigation,
}: ForgotPasswordProps): React.JSX.Element {
  const isOnline = useConnectivity();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const lastSendRef = useRef(0);

  const onSend = async (): Promise<void> => {
    if (loading) return;
    // Debounce / rate-limit: ignore rapid double-taps within 1s
    const now = Date.now();
    if (now - lastSendRef.current < 1000) return;
    if (!email.trim()) {
      setError('Enter your email');
      return;
    }
    if (!isOnline) {
      setError('You are offline — connect to send reset email');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await requestPasswordReset(email);
      lastSendRef.current = now;
      // Generic success avoids email enumeration — Supabase already
      // returns success even if address not found, keep UI generic.
      setSuccess('Check your email for the reset link');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <OfflineBanner visible={!isOnline} />
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

          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we will send you a link to reset your password.
          </Text>

          <View style={styles.form}>
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
              style={styles.inputField}
              onSubmitEditing={() => {
                void onSend();
              }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <Button onPress={onSend} disabled={loading} size="large">
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
