import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface RotatingTextProps {
  children: string;
  style?: TextStyle;
  duration?: number;
  rotationDegrees?: number;
}

export function RotatingText({ 
  children, 
  style, 
  duration = 4000,
  rotationDegrees = 360 
}: RotatingTextProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      rotation.value,
      [0, 1],
      [0, rotationDegrees]
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
}