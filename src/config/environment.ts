export type AppEnvironment = 'development' | 'preview' | 'production';

export function getAppEnvironment(): AppEnvironment {
  const value = process.env.EXPO_PUBLIC_APP_ENV;
  if (value === 'development' || value === 'preview') {
    return value;
  }
  return 'production';
}

export function getAppScheme(): string {
  const environment = getAppEnvironment();
  if (environment === 'development') {
    return 'com.elvira.pos.dev';
  }
  if (environment === 'preview') {
    return 'com.elvira.pos.preview';
  }
  return 'com.elvira.pos';
}

export function getPasswordResetRedirectUrl(): string {
  return `${getAppScheme()}://reset-password`;
}
