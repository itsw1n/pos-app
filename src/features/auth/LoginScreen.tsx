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
import { Ionicons } from '@expo/vector-icons';
import { InputField } from '../../components/common/InputField/InputField';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { radius } from '../../theme';
import { loginScreenStyles } from './LoginScreen.styles';

interface LoginScreenProps {
  style?: StyleProp<ViewStyle>;
}

export function LoginScreen({ style }: LoginScreenProps): React.JSX.Element {
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
    } catch {
      setError('Invalid credentials');
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
            <Pressable style={loginScreenStyles.globeButton}>
              <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={loginScreenStyles.heroContainer}>
            <Text style={loginScreenStyles.heroPlaceholder}>☕</Text>
          </View>

          <Text style={loginScreenStyles.heading}>Welcome back</Text>
          <Text style={loginScreenStyles.subheading}>
            Manage your business easily and efficiently.
          </Text>

           <View style={loginScreenStyles.inputGroup}>
             <Text style={loginScreenStyles.inputLabel}>Username</Text>
             <InputField
               value={username}
               onChangeText={setUsername}
               placeholder="Enter your username"
               autoCapitalize="none"
               autoCorrect={false}
               disabled={isLoading}
               leftIcon={
                 <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
               }
               style={{ borderRadius: radius.xl, height: 52, paddingHorizontal: 14 }}
             />
           </View>

           <View style={loginScreenStyles.inputGroupLarge}>
             <View style={loginScreenStyles.inputLabelRow}>
               <Text style={loginScreenStyles.inputLabel}>Password</Text>
               <Pressable>
                 <Text style={loginScreenStyles.forgotText}>Forgot?</Text>
               </Pressable>
             </View>
             <InputField
               value={password}
               onChangeText={setPassword}
               placeholder="••••••••"
               secureTextEntry={!showPassword}
               disabled={isLoading}
               leftIcon={
                 <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
               }
               rightIcon={
                 <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                   <Ionicons
                     name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                     size={18}
                     color={colors.textSecondary}
                   />
                 </Pressable>
               }
               style={{ borderRadius: radius.xl, height: 52, paddingHorizontal: 14 }}
             />
           </View>

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
        </ScrollView>

        <View style={loginScreenStyles.footer}>
          <Text style={loginScreenStyles.footerText}>
            <Text style={{ color: colors.success }}>●</Text> Secure Connection • v2.4.0
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}