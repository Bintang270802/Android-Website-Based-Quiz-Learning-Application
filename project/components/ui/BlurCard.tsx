import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';

interface BlurCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export function BlurCard({ 
  children, 
  style, 
  intensity = 80,
  tint = 'default' 
}: BlurCardProps) {
  const { isDark, colors } = useTheme();

  const blurTint = tint === 'default' ? (isDark ? 'dark' : 'light') : tint;

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={blurTint}
        style={styles.blur}
      >
        <View style={[
          styles.content,
          { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.3)' }
        ]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: 20,
  },
  content: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});