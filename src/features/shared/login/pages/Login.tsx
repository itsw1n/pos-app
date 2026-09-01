import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { InputField } from '@/components/common/InputField/InputField';
import { useAuth } from '@/context/AuthContext';
import { colors, radius } from '@/theme';
import { loginScreenStyles } from './Login.styles';
import type { LoginStackParamList } from '../LoginNavigator';

interface LoginScreenProps {
  style?: StyleProp<ViewStyle>;
}

export function LoginScreen({ style }: LoginScreenProps): React.JSX.Element {
  const navigation = useNavigation<StackNavigationProp<LoginStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (isLoading) return;
    if (!username.trim() || !password) {
      setError('Please enter your username and password');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('failed to fetch') ||
        message.includes('connection') ||
        message.includes('econnrefused') ||
        message.includes('timeout') ||
        message.includes('unable to') ||
        message.includes('load failed')
      ) {
        setError(
          'Cannot reach server. Check Local Supabase is running and your phone can reach it. Tunnel shares Metro only — for cross-network use: ngrok http 54321 + TUNNELED_SUPABASE_URL.',
        );
      } else if (
        message.includes('invalid api key') ||
        message.includes('api key') ||
        message.includes('apikey')
      ) {
        setError(
          'Invalid Supabase API key. Check EXPO_PUBLIC_SUPABASE_ANON_KEY.',
        );
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[loginScreenStyles.container, style]}>
      <KeyboardAvoidingView
        style={loginScreenStyles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={loginScreenStyles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={loginScreenStyles.topBar}>
            <View style={loginScreenStyles.brandRow}>
              <Text style={loginScreenStyles.logoIcon}>🌿</Text>
              <Text style={loginScreenStyles.brandName}>ElviraCafe</Text>
            </View>
          </View>

          <View style={loginScreenStyles.heroContainer}>
            <Text style={loginScreenStyles.heroPlaceholder}>☕</Text>
          </View>

          <Text style={loginScreenStyles.heading}>Welcome back</Text>
          <Text style={loginScreenStyles.subheading}>
            Manage your business easily and efficiently.
          </Text>

          <View style={loginScreenStyles.inputGroup}>
            <Text style={loginScreenStyles.inputLabel}>Email</Text>
            <InputField
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              disabled={isLoading}
              leftIcon={<User size={18} color={colors.textSecondary} />}
              style={{
                borderRadius: radius.xl,
                height: 52,
                paddingHorizontal: 14,
              }}
            />
          </View>

          <View style={loginScreenStyles.inputGroupLarge}>
            <View style={loginScreenStyles.inputLabelRow}>
              <Text style={loginScreenStyles.inputLabel}>Password</Text>
            </View>
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              disabled={isLoading}
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
          </View>

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={loginScreenStyles.forgotLinkPressable}
          >
            <Text style={loginScreenStyles.forgotLink}>Forgot password?</Text>
          </Pressable>

          {error ? <Text style={loginScreenStyles.error}>{error}</Text> : null}

          <Pressable
            style={loginScreenStyles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={loginScreenStyles.loginButtonText}>
              {isLoading ? 'Signing in...' : 'Log In →'}
            </Text>
          </Pressable>
          <Text
            style={{
              marginTop: 8,
              fontSize: 10,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            {(() => {
              try {
                const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
                return url ? `DB: ${new URL(url).host}` : 'DB: (not set)';
              } catch {
                return `DB: ${process.env.EXPO_PUBLIC_SUPABASE_URL ?? '(invalid)'}`;
              }
            })()}
          </Text>
        </ScrollView>

        <View style={loginScreenStyles.footer}>
          <Text style={loginScreenStyles.footerText}>
            <Text style={{ color: colors.success }}>●</Text> Secure Connection •
            v2.4.0
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
