import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogIn, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ShinyText } from '@/components/ui/ShinyText';
import { BlurCard } from '@/components/ui/BlurCard';
import { RotatingText } from '@/components/ui/RotatingText';

const { width, height } = Dimensions.get('window');

export function LoginScreen() {
  const [nama, setNama] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogin = async () => {
    if (!nama.trim()) {
      Alert.alert('Error', 'Silakan masukkan nama Anda');
      return;
    }

    try {
      setIsLoading(true);
      await login(nama.trim());
      
      // Tambahkan navigasi otomatis ke halaman utama
      import('expo-router').then(({ router }) => {
        router.replace('/(tabs)');
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark 
        ? ['#0F172A', '#1E293B', '#334155'] 
        : ['#F8FAFC', '#E2E8F0', '#CBD5E1']
      }
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <RotatingText style={{ ...styles.iconText, color: colors.primary }}>
              🧠
            </RotatingText>
            <ShinyText style={{ ...styles.title, color: colors.text }}>
              Selamat Datang Kembali!
            </ShinyText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Ayo Tingkatkan Semangat Belajar Anda
            </Text>
          </View>

          {/* Login Form */}
          <BlurCard style={styles.loginCard}>
            <View style={styles.form}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Masukkan Nama Anda
              </Text>
              
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <User size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Nama lengkap"
                  placeholderTextColor={colors.textSecondary}
                  value={nama}
                  onChangeText={setNama}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <AnimatedButton
                title={isLoading ? "Memuat..." : "Mulai Quiz"}
                onPress={handleLogin}
                disabled={isLoading || !nama.trim()}
                icon={<LogIn size={20} color="#FFFFFF" />}
                style={styles.loginButton}
              />
            </View>
          </BlurCard>

          {/* Footer */}
          <View style={styles.footer}>
            <Sparkles size={16} color={colors.accent} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Selamat datang di pengalaman quiz yang menakjubkan
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconText: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginCard: {
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});