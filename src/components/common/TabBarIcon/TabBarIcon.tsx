import React, { useEffect, useState } from 'react';
import { Animated, StyleProp, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { tabBarIconStyles as styles } from './TabBarIcon.styles';

interface TabBarIconProps {
  icon: LucideIcon;
  focused: boolean;
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}

export function TabBarIcon({
  icon: Icon,
  focused,
  color,
  size,
  style,
}: TabBarIconProps): React.JSX.Element {
  const [progress] = useState(() => new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.circle,
          {
            opacity: progress,
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.iconWrap}>
        <Icon color={color} size={size} />
      </View>
    </View>
  );
}
