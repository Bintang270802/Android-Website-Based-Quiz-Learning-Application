import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedButton({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false,
  icon 
}: AnimatedButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return isDark 
          ? ['#3B82F6', '#1E40AF'] 
          : ['#60A5FA', '#3B82F6'];
      case 'secondary':
        return isDark 
          ? ['#1E293B', '#334155'] 
          : ['#F1F5F9', '#E2E8F0'];
      default:
        return ['transparent', 'transparent'];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <LinearGradient
        colors={getGradientColors() as [string, string]}
        style={[
          styles.button,
          variant === 'outline' && { 
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary 
          },
          disabled && styles.disabled
        ]}
      >
        {icon && icon}
        <Text style={[
          styles.buttonText,
          { color: getTextColor() },
          textStyle,
          icon ? styles.buttonTextWithIcon : null
        ]}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextWithIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});