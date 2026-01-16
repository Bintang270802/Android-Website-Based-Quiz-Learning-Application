import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  RefreshControl 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Brain,
  Target
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { quizAPI } from '@/services/api';
import { ShinyText } from '@/components/ui/ShinyText';
import { BlurCard } from '@/components/ui/BlurCard';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { GlareCard } from '@/components/ui/GlareCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Stats {
  totalKategori: number;
  totalPertanyaan: number;
  skorTertinggi: number;
  rataRata: number;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalKategori: 0,
    totalPertanyaan: 0,
    skorTertinggi: 0,
    rataRata: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [kategoris, skorData] = await Promise.all([
        quizAPI.getKategori(),
        quizAPI.getSkor()
      ]);

      const totalKategori = kategoris.length;
      let totalPertanyaan = 0;
      
      // Hitung total pertanyaan dari semua kategori
      for (const kategori of kategoris) {
        try {
          const pertanyaans = await quizAPI.getPertanyaan(kategori._id);
          totalPertanyaan += pertanyaans.length;
        } catch (error) {
          console.error('Error loading questions for category:', error);
        }
      }

      const skorTertinggi = skorData.length > 0 
        ? Math.max(...skorData.map(s => s.persentase)) 
        : 0;
      
      const rataRata = skorData.length > 0
        ? skorData.reduce((sum, s) => sum + s.persentase, 0) / skorData.length
        : 0;

      setStats({
        totalKategori,
        totalPertanyaan,
        skorTertinggi,
        rataRata
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleStartQuiz = () => {
    router.push('/(tabs)/quiz');
  };

  const handleViewScores = () => {
    router.push('/(tabs)/skor');
  };

  return (
    <LinearGradient
      colors={isDark 
        ? ['#0F172A', '#1E293B'] 
        : ['#F8FAFC', '#E2E8F0']
      }
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <BlurCard style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <User size={40} color={colors.primary} />
              <View style={styles.welcomeText}>
                <Text style={[styles.welcomeGreeting, { color: colors.textSecondary }]}>
                  Selamat datang,
                </Text>
                <ShinyText style={{ ...styles.welcomeName, color: colors.text }}>
                  {user?.nama || 'Pengguna'}
                </ShinyText>
              </View>
            </View>
            <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
              Siap untuk tantangan quiz hari ini?
            </Text>
          </View>
        </BlurCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <GlareCard style={styles.actionCard} onPress={handleStartQuiz}>
            <View style={styles.actionContent}>
              <BookOpen size={32} color={colors.primary} />
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                Mulai Quiz
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                Pilih kategori dan mulai
              </Text>
            </View>
          </GlareCard>

          <GlareCard style={styles.actionCard} onPress={handleViewScores}>
            <View style={styles.actionContent}>
              <Trophy size={32} color={colors.accent} />
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                Lihat Skor
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                Pantau perkembangan
              </Text>
            </View>
          </GlareCard>
        </View>

        {/* Statistics */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Statistik
        </Text>
        
        <View style={styles.statsGrid}>
          <FloatingCard style={styles.statCard}>
            <Brain size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.totalKategori}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Kategori
            </Text>
          </FloatingCard>

          <FloatingCard style={styles.statCard}>
            <Target size={24} color={colors.accent} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.totalPertanyaan}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pertanyaan
            </Text>
          </FloatingCard>

          <FloatingCard style={styles.statCard}>
            <TrendingUp size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {Math.round(stats.skorTertinggi)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Skor Tertinggi
            </Text>
          </FloatingCard>

          <FloatingCard style={styles.statCard}>
            <Sparkles size={24} color={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {Math.round(stats.rataRata)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Rata-rata
            </Text>
          </FloatingCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AnimatedButton
            title="Mulai Quiz Sekarang"
            onPress={handleStartQuiz}
            icon={<BookOpen size={20} color="#FFFFFF" />}
            style={styles.primaryButton}
          />
          
          <AnimatedButton
            title="Keluar"
            onPress={logout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    marginTop: 8,
  },
  welcomeContent: {
    gap: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtext: {
    fontSize: 16,
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
  },
  actionContent: {
    alignItems: 'center',
    gap: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 56) / 2,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
});