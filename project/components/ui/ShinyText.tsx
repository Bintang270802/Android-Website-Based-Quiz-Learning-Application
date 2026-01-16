import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface ShinyTextProps {
  children: string;
  style?: TextStyle;
  colors?: string[];
  duration?: number;
}

export function ShinyText({ 
  children, 
  style, 
  colors,
  duration = 2000 
}: ShinyTextProps) {
  const { colors: themeColors } = useTheme();
  const progress = useSharedValue(0);

  const defaultColors = colors || [
    themeColors.primary,
    themeColors.accent,
    themeColors.secondary,
    themeColors.primary,
  ];

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 0.33, 0.66, 1],
      defaultColors
    );

    return {
      color,
    };
  });

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
}