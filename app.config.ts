import { ConfigContext, ExpoConfig } from 'expo/config';

type AppVariant = 'development' | 'preview' | 'production';

function appVariant(): AppVariant {
  const value = process.env.APP_VARIANT;
  if (value === 'preview' || value === 'production') {
    return value;
  }
  return 'development';
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = appVariant();
  const isDevelopment = variant === 'development';
  const isPreview = variant === 'preview';
  const packageSuffix = isDevelopment ? '.dev' : isPreview ? '.preview' : '';
  const nameSuffix = isDevelopment ? ' Dev' : isPreview ? ' Preview' : '';

  return {
    ...config,
    name: `pos-application${nameSuffix}`,
    slug: 'pos-application',
    scheme: `com.elvira.pos${packageSuffix}`,
    version: '1.1.2',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    owner: 'itsw1n2s-team',
    ios: {
      supportsTablet: true,
      bundleIdentifier: `com.elvira.pos${packageSuffix}`,
    },
    android: {
      package: `com.elvira.pos${packageSuffix}`,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-sqlite',
      'expo-font',
      'expo-sharing',
      'expo-image',
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow access to your photos to set a product image',
        },
      ],
      [
        'react-native-thermal-printer-driver',
        {
          bluetoothAlwaysUsageDescription:
            'Elvira Cafe uses Bluetooth to connect to your receipt printer.',
          bluetoothPeripheralUsageDescription:
            'Elvira Cafe uses Bluetooth to connect to your receipt printer.',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            buildArchs: ['arm64-v8a', 'armeabi-v7a'],
            usesCleartextTraffic: isDevelopment,
          },
        },
      ],
    ],
    extra: {
      appVariant: variant,
      eas: {
        projectId: '4b435660-faed-4bdc-8c3d-7b5926ad795e',
      },
    },
  };
};
