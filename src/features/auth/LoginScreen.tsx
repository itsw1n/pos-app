import React, { useState } from 'react';
import { Pressable, StyleProp, Text, TextInput, View, ViewStyle } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { loginScreenStyles } from './LoginScreen.styles';

interface LoginScreenProps {
  style?: StyleProp<ViewStyle>;
}

export function LoginScreen({ style }: LoginScreenProps): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <View style={[loginScreenStyles.container, style]}>
      <Text style={loginScreenStyles.title}>IPSS - Cafe Elvira</Text>
      <TextInput
        style={[loginScreenStyles.input, error ? loginScreenStyles.inputError : null]}
        placeholder="Username"
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />
      <TextInput
        style={[loginScreenStyles.input, error ? loginScreenStyles.inputError : null]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      {error ? <Text style={loginScreenStyles.error}>{error}</Text> : null}
      <Pressable
        style={({ pressed }) => [
          loginScreenStyles.button,
          pressed ? loginScreenStyles.buttonPressed : null,
          isLoading ? loginScreenStyles.buttonDisabled : null,
        ]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={loginScreenStyles.buttonText}>
          {isLoading ? 'Signing in...' : 'Login'}
        </Text>
      </Pressable>
    </View>
  );
}
