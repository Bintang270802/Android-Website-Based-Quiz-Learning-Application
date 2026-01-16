import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface GlareCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlareCard({ children, onPress, style }: GlareCardProps) {
  const { colors, isDark } = useTheme();
  const glarePosition = useSharedValue(-1);
  const scale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const glareAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      glarePosition.value,
      [-1, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
      opacity: interpolate(
        glarePosition.value,
        [-1, -0.5, 0.5, 1],
        [0, 0.5, 0.5, 0]
      ),
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.98);
    glarePosition.value = withTiming(1, { duration: 800 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1);
    glarePosition.value = -1;
  };

  return (
    <AnimatedTouchable
      style={[cardAnimatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
        }
      ]}>
        {children}
        <Animated.View style={[styles.glareContainer, glareAnimatedStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)',
              'transparent'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.glare}
          />
        </Animated.View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  glareContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  glare: {
    flex: 1,
    width: 100,
  },
});